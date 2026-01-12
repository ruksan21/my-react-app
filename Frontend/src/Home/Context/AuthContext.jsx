/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import { API_ENDPOINTS } from "../../config/api";

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);

  // Admin/Backend Simulation State
  const [allUsers, setAllUsers] = useState([]);
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [wards, setWards] = useState([]);
  const [wardsLoading, setWardsLoading] = useState(false);

  // Data Fetching Functions
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.users.getAll);
      const data = await response.json();
      if (data.success) {
        // Map created_at to joinedDate for frontend calculations
        const formattedUsers = data.data.map((u) => ({
          ...u,
          joinedDate: u.created_at || u.joinedDate,
        }));
        setAllUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPendingOfficers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.users.getPendingOfficers);
      const data = await response.json();
      if (data.success) {
        setPendingOfficers(data.data);
      }
    } catch (error) {
      console.error("Error fetching pending officers:", error);
    }
  };

  const refreshWards = async () => {
    setWardsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.wards.getAll);
      const data = await response.json();
      if (data.success) {
        const formattedWards = data.data.map((ward) => ({
          id: ward.id,
          number: ward.ward_number,
          name: `Ward ${ward.ward_number}`,
          municipality: ward.municipality || ward.district_name,
          location: ward.location,
          contact: ward.contact_phone,
          chairperson: {
            name: ward.chairperson_name || "Not Assigned",
            image: null,
            message: "",
          },
        }));
        setWards(formattedWards);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    } finally {
      setWardsLoading(false);
    }
  };

  const refreshSession = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.users.getAll}?id=${user.id}`
      );
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        const dbUser = data.data[0];
        if (dbUser.first_name && dbUser.last_name) {
          dbUser.name = `${dbUser.first_name} ${dbUser.last_name}`;
        }
        if (dbUser.photo) {
          dbUser.photoUrl = `${API_ENDPOINTS.authUploads}/${dbUser.photo}`;
        }

        // Only update if there's a meaningful change in location or ID
        if (
          dbUser.work_province !== user.work_province ||
          dbUser.work_district !== user.work_district ||
          dbUser.work_municipality !== user.work_municipality ||
          dbUser.work_ward !== user.work_ward ||
          dbUser.photo !== user.photo
        ) {
          const updatedUser = { ...user, ...dbUser };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          console.log("Session refreshed with latest DB data.");
        }
      }
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }, [user]);

  // Load initial data
  // Load initial data
  useEffect(() => {
    // 1. Load Current User
    const storedUser = localStorage.getItem("user");
    const loggedIn = localStorage.getItem("isLoggedIn");

    if (storedUser && loggedIn === "true") {
      const userData = JSON.parse(storedUser);

      // Fix for missing name or photoUrl in stored data
      if (!userData.name && userData.first_name && userData.last_name) {
        userData.name = `${userData.first_name} ${userData.last_name}`;
      }
      if (!userData.photoUrl && userData.photo) {
        userData.photoUrl = `${API_ENDPOINTS.authUploads}/${userData.photo}`;
      }

      setUser(userData);
      setIsLoggedIn(true);

      const storedActivities = localStorage.getItem(
        `activities_${userData.id || "default"}`
      );
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    }

    // 2. Load "Backend" Data
    fetchAllUsers();
    fetchPendingOfficers();
    refreshWards();

    setLoading(false);
  }, []);

  // 3. Refresh session from DB to ensure latest location
  useEffect(() => {
    if (isLoggedIn && user?.id) {
      refreshSession();
    }
  }, [refreshSession, isLoggedIn, user?.id]);

  // --- Auth Functions ---

  const login = (userData, workLocation = null) => {
    const userWithLocation = { ...userData };

    // Map DB fields to frontend standard fields
    if (userData.first_name && userData.last_name) {
      userWithLocation.name = `${userData.first_name} ${userData.last_name}`;
    }

    if (userData.photo) {
      userWithLocation.photoUrl = `${API_ENDPOINTS.authUploads}/${userData.photo}`;
    }

    if (workLocation) {
      userWithLocation.workLocation = workLocation;
    }

    setUser(userWithLocation);
    setIsLoggedIn(true);
    localStorage.setItem("user", JSON.stringify(userWithLocation));
    localStorage.setItem("isLoggedIn", "true");

    logActivity("login", "Login successfully");
    addNotification("success", "Login successfully");
  };

  // Memoized officer work location object
  const officerWorkLocation = React.useMemo(() => {
    if (
      user?.work_province ||
      user?.work_district ||
      user?.work_municipality ||
      user?.work_ward ||
      user?.work_office_location
    ) {
      return {
        work_province: user?.work_province || null,
        work_district: user?.work_district || null,
        work_municipality: user?.work_municipality || null,
        work_ward: user?.work_ward || null,
        work_office_location: user?.work_office_location || null,
      };
    }
    // Check old workLocation object if it exists (legacy/previous state)
    if (user?.workLocation) {
      return user.workLocation;
    }
    return null;
  }, [
    user?.work_province,
    user?.work_district,
    user?.work_municipality,
    user?.work_ward,
    user?.work_office_location,
    user?.workLocation,
  ]);

  // Getter function for backward compatibility
  const getOfficerWorkLocation = React.useCallback(
    () => officerWorkLocation,
    [officerWorkLocation]
  );

  const logout = () => {
    if (user) {
      logActivity("logout", "Logged out");
    }
    setUser(null);
    setIsLoggedIn(false);
    setActivities([]);
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
  };

  // --- User/Profile Functions ---

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));

    // Also update in allUsers list if applicable
    const updatedAllUsers = allUsers.map((u) =>
      u.email === user.email ? { ...u, ...updatedData } : u
    );
    setAllUsers(updatedAllUsers);
    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

    logActivity("profile_update", "Profile information updated");
  };

  const updateProfilePhoto = (photoUrl) => {
    const newUserData = { ...user, photoUrl };
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));

    // Also update in allUsers list
    const updatedAllUsers = allUsers.map((u) =>
      u.email === user.email ? { ...u, photoUrl } : u
    );
    setAllUsers(updatedAllUsers);
    localStorage.setItem("allUsers", JSON.stringify(updatedAllUsers));

    logActivity("photo_change", "Profile photo updated");
    addNotification("success", "Profile photo updated successfully");
  };

  // --- Admin / Management Functions ---

  const registerUser = (userData) => {
    // If officer, add to pendingOfficers
    if (userData.role === "officer") {
      const newOfficer = { ...userData, id: Date.now(), status: "pending" };
      const updatedPending = [...pendingOfficers, newOfficer];
      setPendingOfficers(updatedPending);
      localStorage.setItem("pendingOfficers", JSON.stringify(updatedPending));
      return {
        success: true,
        message: "Officer application submitted for review.",
      };
    }
    // If citizen/user, add to allUsers directly
    else {
      const newUser = { ...userData, id: Date.now(), status: "active" };
      const updatedUsers = [...allUsers, newUser];
      setAllUsers(updatedUsers);
      localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
      return { success: true, message: "Registration successful." };
    }
  };

  // Admin creating officer directly
  const createOfficer = (officerData) => {
    // Check if ID already exists
    const exists = allUsers.some(
      (u) =>
        u.employeeId === officerData.employeeId ||
        u.officerId === officerData.officerId
    );
    if (exists) {
      return { success: false, message: "Officer ID already exists." };
    }

    const newOfficer = {
      ...officerData,
      id: Date.now(),
      role: "officer",
      status: "active", // Created by admin, so active immediately
      joinedDate: new Date().toLocaleDateString("en-GB"),
    };

    const updatedUsers = [...allUsers, newOfficer];
    setAllUsers(updatedUsers);
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));

    addNotification("success", `Officer ${officerData.name} created.`);
    return { success: true, message: "Officer created successfully." };
  };

  // Create Backend System Alert
  const createSystemAlert = async (type, title, message) => {
    try {
      await fetch(API_ENDPOINTS.alerts.manageAlerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          type,
          title,
          message,
        }),
      });
    } catch (err) {
      console.error("Failed to create system alert:", err);
    }
  };

  const approveOfficer = async (officerDataOrId) => {
    // Check if we received an object or just an ID
    const officerId =
      typeof officerDataOrId === "object"
        ? officerDataOrId.id
        : officerDataOrId;
    const officerDetails = pendingOfficers.find((o) => o.id === officerId);

    try {
      const response = await fetch(API_ENDPOINTS.users.updateOfficerStatus, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: officerId, status: "active" }),
      });
      const data = await response.json();

      if (data.success) {
        // Remove from pending
        setPendingOfficers(pendingOfficers.filter((o) => o.id !== officerId));

        // Add to active users if valid details found
        if (officerDetails) {
          const newOfficer = {
            ...officerDetails,
            status: "active",
            role: "officer",
            joinedDate: new Date().toLocaleDateString("en-GB"),
          };
          const updatedUsers = [...allUsers, newOfficer];
          setAllUsers(updatedUsers);
          localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
        }

        addNotification("success", "Officer approved successfully.");
        createSystemAlert(
          "success",
          "Officer Approved",
          `An officer (ID: ${officerId}) has been approved and activated.`
        );
      } else {
        addNotification("error", data.message);
      }
    } catch {
      addNotification("error", "Failed to approve officer.");
    }
  };

  const rejectOfficer = async (officerId) => {
    try {
      const response = await fetch(API_ENDPOINTS.users.updateOfficerStatus, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: officerId, status: "rejected" }),
      });
      const data = await response.json();
      if (data.success) {
        setPendingOfficers(pendingOfficers.filter((o) => o.id !== officerId));
        addNotification("info", "Officer application rejected.");
        createSystemAlert(
          "warning",
          "Officer Rejected",
          `An officer application (ID: ${officerId}) was rejected.`
        );
      } else {
        addNotification("error", data.message);
      }
    } catch {
      addNotification("error", "Failed to reject officer.");
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(API_ENDPOINTS.users.delete, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userId }),
        });
        const data = await response.json();
        if (data.success) {
          setAllUsers(allUsers.filter((u) => u.id !== userId));
          addNotification("success", "User deleted successfully.");
          createSystemAlert(
            "info",
            "User Deleted",
            `A user (ID: ${userId}) has been deleted from the system.`
          );
        } else {
          addNotification("error", data.message);
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        addNotification("error", "Failed to delete user.");
      }
    }
  };

  // Ward Management
  const updateWard = (wardId, wardData) => {
    const updatedWards = wards.map((w) =>
      w.id === wardId ? { ...w, ...wardData } : w
    );
    setWards(updatedWards);
    localStorage.setItem("wards", JSON.stringify(updatedWards));
    addNotification("success", `Ward ${wardData.number} updated successfully.`);
  };

  // System Stats (for Reports)
  const getSystemStats = () => {
    const totalUsers = allUsers.filter((u) => u.role === "user").length;
    const totalOfficers = allUsers.filter((u) => u.role === "officer").length;
    const totalWards = wards.length;

    return {
      totalUsers,
      totalOfficers,
      totalWards,
      revenue: 4500000, // Mock
    };
  };

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type, // 'success', 'error', 'info', 'warning'
      message,
    };
    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const logActivity = (activityType, description) => {
    const activity = {
      id: Date.now(),
      type: activityType,
      description,
      timestamp: new Date().toISOString(),
    };

    const newActivities = [activity, ...activities];
    setActivities(newActivities);
    const userId = user?.id || "default";
    localStorage.setItem(`activities_${userId}`, JSON.stringify(newActivities));
  };

  const hasRole = (role) => user?.role === role;
  const hasPermission = (permission) =>
    user?.permissions?.includes(permission) || false;

  const value = {
    user,
    isLoggedIn,
    loading,
    notifications,
    activities,
    allUsers, // Exposed for Admin
    pendingOfficers, // Exposed for Admin
    wards, // Exposed for Admin
    wardsLoading,
    login,
    logout,
    updateUser,
    updateProfilePhoto,
    registerUser,
    approveOfficer,
    rejectOfficer,
    deleteUser,
    createOfficer,
    updateWard,
    refreshWards, // Exposed function
    fetchPendingOfficers, // Exposed function
    getSystemStats,
    addNotification,
    removeNotification,
    logActivity,
    createSystemAlert,
    hasRole,
    hasPermission,
    getOfficerWorkLocation, // Exposed function for components
    officerWorkLocation, // Memoized work location object
    refreshSession,
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
