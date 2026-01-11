import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./UserManagement.css";

const UserManagement = () => {
  const { allUsers, deleteUser, addNotification } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    role: "",
    status: "",
    gender: "",
    dob: "",
    province: "",
    district: "",
    city: "",
    wardNumber: "",
    citizenshipNumber: "",
    officerId: "",
    department: "",
    workProvince: "",
    workDistrict: "",
    workMunicipality: "",
    workWard: "",
    workOfficeLocation: "",
  });

  // Helper to get display name from user object
  const getUserDisplayName = (user) => {
    if (!user) return "Unknown";
    const parts = [user.first_name, user.middle_name, user.last_name].filter(
      (p) => p && p.trim() !== ""
    );
    return parts.length > 0 ? parts.join(" ") : "Unknown User";
  };

  useEffect(() => {
    // Add delay to ensure allUsers is loaded
    const timer = setTimeout(() => {
      if (allUsers && Array.isArray(allUsers)) {
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [allUsers]);

  useEffect(() => {
    if (!users || users.length === 0) return;

    let result = users;

    if (roleFilter !== "all") {
      result = result.filter(
        (user) =>
          user.role && user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((user) => {
        const fullName = getUserDisplayName(user).toLowerCase();
        const email = (user.email || "").toLowerCase();
        return fullName.includes(lowerSearch) || email.includes(lowerSearch);
      });
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      firstName: user.first_name || "",
      middleName: user.middle_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      contactNumber: user.contact_number || "",
      role: user.role || "",
      status: user.status || "active",
      gender: user.gender || "",
      dob: user.dob || "",
      province: user.province || "",
      district: user.district || "",
      city: user.city || "",
      wardNumber: user.ward_number || "",
      citizenshipNumber: user.citizenship_number || "",
      officerId: user.officer_id || "",
      department: user.department || "",
      workProvince: user.work_province || "",
      workDistrict: user.work_district || "",
      workMunicipality: user.work_municipality || "",
      workWard: user.work_ward || "",
      workOfficeLocation: user.work_office_location || "",
    });
    setIsEditing(true);
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setIsViewing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updateData = {
        id: selectedUser.id,
        first_name: editForm.firstName,
        middle_name: editForm.middleName,
        last_name: editForm.lastName,
        contact_number: editForm.contactNumber || null,
        role: editForm.role,
        status: editForm.status,
        gender: editForm.gender || null,
        dob: editForm.dob || null,
        province: editForm.province || null,
        district: editForm.district || null,
        city: editForm.city || null,
        ward_number: editForm.wardNumber ? parseInt(editForm.wardNumber) : null,
        citizenship_number: editForm.citizenshipNumber || null,
        officer_id: editForm.officerId || null,
        department: editForm.department || null,
        work_province: editForm.workProvince || null,
        work_district: editForm.workDistrict || null,
        work_municipality: editForm.workMunicipality || null,
        work_ward: editForm.workWard ? parseInt(editForm.workWard) : null,
        work_office_location: editForm.workOfficeLocation || null,
      };

      const response = await fetch(API_ENDPOINTS.users.update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh users list
        const refreshResponse = await fetch(API_ENDPOINTS.users.getAll);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setUsers(refreshData.data);
          setFilteredUsers(refreshData.data);
          if (addNotification) {
            addNotification("success", "User updated successfully!");
          } else {
            alert("User updated successfully!");
          }
        }
        setIsEditing(false);
        setSelectedUser(null);
      } else {
        if (addNotification) {
          addNotification("error", data.message || "Failed to update user.");
        } else {
          alert(data.message || "Failed to update user.");
        }
      }
    } catch (error) {
      console.error("Error updating user:", error);
      if (addNotification) {
        addNotification("error", "Failed to update user. Please try again.");
      } else {
        alert("Failed to update user. Please try again.");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModals = () => {
    setIsEditing(false);
    setIsViewing(false);
    setSelectedUser(null);
  };

  if (isLoading) {
    return (
      <AdminLayout title="User Management">
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading users...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      {/* View User Modal */}
      {isViewing && selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal-content user-profile-content">
            <div className="profile-header-center">
              <div className="profile-avatar-large">
                {selectedUser.photo ? (
                  <img
                    src={`${API_ENDPOINTS.authUploads}/${selectedUser.photo}`}
                    alt="Profile"
                    className="profile-img-fill"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = (
                        selectedUser.first_name || "U"
                      )
                        .charAt(0)
                        .toUpperCase();
                    }}
                  />
                ) : (
                  (selectedUser.first_name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <h2 style={{ marginTop: "16px", marginBottom: "4px" }}>
                {getUserDisplayName(selectedUser)}
              </h2>
              <span
                className={`profile-role-badge role-${selectedUser.role.toLowerCase()}`}
              >
                {selectedUser.role}
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{selectedUser.email || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value">#{selectedUser.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Number</span>
                <span className="detail-value">{selectedUser.contact_number || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`status-badge-${selectedUser.status || "active"}`} style={{ display: "inline-block" }}>
                  {(selectedUser.status || "active").charAt(0).toUpperCase() + (selectedUser.status || "active").slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{selectedUser.gender || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{selectedUser.dob || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Province</span>
                <span className="detail-value">{selectedUser.province || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">District</span>
                <span className="detail-value">{selectedUser.district || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">City</span>
                <span className="detail-value">{selectedUser.city || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ward Number</span>
                <span className="detail-value">{selectedUser.ward_number || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Citizenship Number</span>
                <span className="detail-value">{selectedUser.citizenship_number || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Joined Date</span>
                <span className="detail-value">
                  {selectedUser.created_at || "N/A"}
                </span>
              </div>
            </div>

            {/* Officer Specific Fields */}
            {(selectedUser.role === "officer" || selectedUser.officer_id || selectedUser.department) && (
              <div style={{ marginTop: "24px" }}>
                <h4 style={{ marginBottom: "16px", fontSize: "1.1rem", fontWeight: 600 }}>Officer Details</h4>
                <div className="profile-details-grid">
                  {selectedUser.officer_id && (
                    <div className="detail-item">
                      <span className="detail-label">Officer ID</span>
                      <span className="detail-value">{selectedUser.officer_id}</span>
                    </div>
                  )}
                  {selectedUser.department && (
                    <div className="detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{selectedUser.department}</span>
                    </div>
                  )}
                  {selectedUser.work_province && (
                    <div className="detail-item">
                      <span className="detail-label">Work Province</span>
                      <span className="detail-value">{selectedUser.work_province}</span>
                    </div>
                  )}
                  {selectedUser.work_district && (
                    <div className="detail-item">
                      <span className="detail-label">Work District</span>
                      <span className="detail-value">{selectedUser.work_district}</span>
                    </div>
                  )}
                  {selectedUser.work_municipality && (
                    <div className="detail-item">
                      <span className="detail-label">Work Municipality</span>
                      <span className="detail-value">{selectedUser.work_municipality}</span>
                    </div>
                  )}
                  {selectedUser.work_ward && (
                    <div className="detail-item">
                      <span className="detail-label">Work Ward</span>
                      <span className="detail-value">{selectedUser.work_ward}</span>
                    </div>
                  )}
                  {selectedUser.work_office_location && (
                    <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                      <span className="detail-label">Office Location</span>
                      <span className="detail-value">{selectedUser.work_office_location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="user-modal-actions">
              <button onClick={closeModals} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal-content" style={{ maxHeight: "90vh", overflowY: "auto", width: "700px" }}>
            <div className="user-modal-header">
              <h3 className="user-modal-title">Edit User</h3>
              <button onClick={closeModals} className="user-close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="user-form-grid">
              {/* Basic Information */}
              <h4 style={{ marginBottom: "12px", fontSize: "1rem", fontWeight: 600, color: "#475569" }}>Basic Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">First Name *</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="user-input"
                    required
                  />
                </div>
                <div>
                  <label className="stat-label">Middle Name</label>
                  <input
                    type="text"
                    value={editForm.middleName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, middleName: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
                <div>
                  <label className="stat-label">Last Name *</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="user-input"
                    required
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    disabled
                    className="user-input"
                    style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                  />
                </div>
                <div>
                  <label className="stat-label">Contact Number</label>
                  <input
                    type="text"
                    value={editForm.contactNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, contactNumber: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">Role *</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="user-select"
                    required
                  >
                    <option value="citizen">Citizen</option>
                    <option value="officer">Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="stat-label">Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="user-select"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Personal Information */}
              <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1rem", fontWeight: 600, color: "#475569" }}>Personal Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gender: e.target.value })
                    }
                    className="user-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="stat-label">Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dob: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
              </div>
              <div>
                <label className="stat-label">Citizenship Number</label>
                <input
                  type="text"
                  value={editForm.citizenshipNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, citizenshipNumber: e.target.value })
                  }
                  className="user-input"
                />
              </div>

              {/* Address Information */}
              <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1rem", fontWeight: 600, color: "#475569" }}>Address Information</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">Province</label>
                  <input
                    type="text"
                    value={editForm.province}
                    onChange={(e) =>
                      setEditForm({ ...editForm, province: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
                <div>
                  <label className="stat-label">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) =>
                      setEditForm({ ...editForm, district: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="stat-label">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) =>
                      setEditForm({ ...editForm, city: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
                <div>
                  <label className="stat-label">Ward Number</label>
                  <input
                    type="number"
                    value={editForm.wardNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, wardNumber: e.target.value })
                    }
                    className="user-input"
                  />
                </div>
              </div>

              {/* Officer Information */}
              {(editForm.role === "officer" || selectedUser.role === "officer") && (
                <>
                  <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "1rem", fontWeight: 600, color: "#475569" }}>Officer Information</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="stat-label">Officer ID</label>
                      <input
                        type="text"
                        value={editForm.officerId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, officerId: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                    <div>
                      <label className="stat-label">Department</label>
                      <input
                        type="text"
                        value={editForm.department}
                        onChange={(e) =>
                          setEditForm({ ...editForm, department: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                  </div>
                  <h5 style={{ marginTop: "16px", marginBottom: "8px", fontSize: "0.9rem", fontWeight: 600, color: "#64748b" }}>Work Location</h5>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="stat-label">Work Province</label>
                      <input
                        type="text"
                        value={editForm.workProvince}
                        onChange={(e) =>
                          setEditForm({ ...editForm, workProvince: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                    <div>
                      <label className="stat-label">Work District</label>
                      <input
                        type="text"
                        value={editForm.workDistrict}
                        onChange={(e) =>
                          setEditForm({ ...editForm, workDistrict: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="stat-label">Work Municipality</label>
                      <input
                        type="text"
                        value={editForm.workMunicipality}
                        onChange={(e) =>
                          setEditForm({ ...editForm, workMunicipality: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                    <div>
                      <label className="stat-label">Work Ward</label>
                      <input
                        type="number"
                        value={editForm.workWard}
                        onChange={(e) =>
                          setEditForm({ ...editForm, workWard: e.target.value })
                        }
                        className="user-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="stat-label">Office Location</label>
                    <input
                      type="text"
                      value={editForm.workOfficeLocation}
                      onChange={(e) =>
                        setEditForm({ ...editForm, workOfficeLocation: e.target.value })
                      }
                      className="user-input"
                    />
                  </div>
                </>
              )}

              <div className="user-modal-actions" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-cancel"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-user" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-actions">
          <h2 className="section-title">All System Users</h2>
          <div className="filter-section">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-filter-select"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {filteredUsers.length} users
            </span>
          </div>
        </div>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="table-avatar-circle">
                        {user.photo ? (
                          <img
                            src={`${API_ENDPOINTS.authUploads}/${user.photo}`}
                            alt=""
                            className="table-img-fill"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerText = (
                                user.first_name || "U"
                              )
                                .charAt(0)
                                .toUpperCase();
                            }}
                          />
                        ) : (
                          (user.first_name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {getUserDisplayName(user)}
                        </div>
                        <div className="user-email-text">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "admin"
                          ? "approved" /* Reusing established badge classes if possible or new ones */
                          : user.role === "officer"
                          ? "pending"
                          : "rejected" /* Just as fallback, or use custom CSS */
                      }`}
                      style={{
                        /* Overriding with specific colors from CSS if needed, 
                           but for now using existing 'badge' class + creating new if needed.
                           Actually, let's use the explicit role styles from CSS if possible?
                           No, table badges are usually small. Let's keep it simple.
                        */
                        backgroundColor:
                          user.role === "admin"
                            ? "#e0f2fe"
                            : user.role === "officer"
                            ? "#f0fdf4"
                            : "#f3f4f6",
                        color:
                          user.role === "admin"
                            ? "#0284c7"
                            : user.role === "officer"
                            ? "#16a34a"
                            : "#4b5563",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.created_at || "N/A"}</td>
                  <td>
                    <span className="status-badge-active">Active</span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-icon-action"
                        title="View"
                        onClick={() => handleViewClick(user)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon-action"
                        title="Edit"
                        onClick={() => handleEditClick(user)}
                      >
                        ✏️
                      </button>
                      {user.role !== "admin" && (
                        <button
                          className="btn-icon-action btn-icon-delete"
                          title="Delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
