import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import NotificationPanel from "../Component/NotificationPanel";
import { API_ENDPOINTS } from "../../config/api";
import "./ProfileSection.css";

const ProfileSection = () => {
  const {
    user,
    updateUser,
    addNotification,
    notifications,
    removeNotification,
  } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    municipality: "",
    ward: "",
    profileImage: null,
  });

  // Initialize form data when user data is available or when entering edit mode
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.contact_number || user.phone || "",
        occupation: user.occupation || "",
        municipality:
          user.municipality ||
          user.work_municipality ||
          "Kathmandu Metropolitan City",
        ward: user.ward_number || user.ward || "1",
        profileImage: user.photoUrl || user.profileImage || null,
      });
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form to current user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.contact_number || user.phone || "",
        occupation: user.occupation || "",
        municipality:
          user.municipality ||
          user.work_municipality ||
          "Kathmandu Metropolitan City",
        ward: user.ward_number || user.ward || "1",
        profileImage: user.photoUrl || user.profileImage || null,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClick = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // Split name into first and last for backend if needed
      const nameParts = formData.name.split(" ");
      const firstName = nameParts[0];
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      const response = await fetch(API_ENDPOINTS.users.update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          contact_number: formData.phone,
          occupation: formData.occupation,
          // Only users can change their ward/municipality here, officers are locked.
          ...(user.role !== "officer"
            ? {
                municipality: formData.municipality,
                ward_number: formData.ward,
              }
            : {}),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local context
        updateUser({
          ...formData,
          name: formData.name, // Keep as combined name for frontend
          contact_number: formData.phone,
        });
        setIsEditing(false);
        addNotification("success", "Profile updated successfully!");
      } else {
        addNotification("error", data.message || "Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification("error", "Failed to update profile. Connection error.");
    } finally {
      setIsSaving(false);
    }
  };

  // Mock Database for Municipalities
  const municipalities = [
    "Kathmandu Metropolitan City",
    "Lalitpur Metropolitan City",
    "Bhaktapur Municipality",
    "Pokhara Metropolitan City",
    "Biratnagar Metropolitan City",
    "Bharatpur Metropolitan City",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      // Simulating upload for demo - in real app use FormData and a separate photo upload API
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, profileImage: imageUrl });
        // updateProfilePhoto(imageUrl); // This updates local context immediately
        setIsUploading(false);
        addNotification(
          "info",
          "Photo selected. Save changes to update profile."
        );
      }, 1000);
    }
  };

  return (
    <>
      <NotificationPanel
        notifications={notifications}
        onClose={removeNotification}
      />
      <div className="profile-layout">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-profile-summary">
            <div className="profile-avatar-large">
              {formData.profileImage || user?.profileImage ? (
                <img
                  src={formData.profileImage || user.profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <h3>{user?.name || "User Name"}</h3>
            <p className="profile-role">
              {user?.ward
                ? `Ward No. ${user.ward.replace("Ward ", "")}`
                : "User"}
            </p>
          </div>

          <nav className="sidebar-nav">
            <button
              className={`sidebar-link ${
                activeTab === "personal" ? "active" : ""
              }`}
              onClick={() => setActiveTab("personal")}
            >
              <i className="fa-regular fa-user"></i> Personal Information
            </button>
            <button
              className={`sidebar-link ${
                activeTab === "activity" ? "active" : ""
              }`}
              onClick={() => setActiveTab("activity")}
            >
              <i className="fa-solid fa-clock-rotate-left"></i> Activity History
            </button>
            <button
              className={`sidebar-link ${
                activeTab === "preferences" ? "active" : ""
              }`}
              onClick={() => setActiveTab("preferences")}
            >
              <i className="fa-solid fa-gear"></i> Preferences
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === "personal" && (
            <div className="content-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                {!isEditing && (
                  <button className="btn-edit" onClick={handleEditClick}>
                    Edit
                  </button>
                )}
              </div>
              <div className="card-body">
                {isEditing ? (
                  /* Edit Mode Form */
                  <div className="edit-form">
                    {/* Profile Picture Upload */}
                    <div
                      className="form-group"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <label>Profile Picture</label>
                      <div className="file-upload-wrapper">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="form-control file-input"
                        />
                        <div className="file-upload-icon">
                          <i
                            className={`fa-solid ${
                              isUploading ? "fa-spinner fa-spin" : "fa-camera"
                            }`}
                          ></i>
                          <span>
                            {isUploading
                              ? "Uploading..."
                              : "Change Profile Picture"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Municipality</label>
                      <select
                        name="municipality"
                        value={formData.municipality}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="">Select Municipality</option>
                        {municipalities.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Ward</label>
                      {user?.role === "officer" ? (
                        <div className="ward-locked-info">
                          <input
                            type="text"
                            name="ward"
                            value={formData.ward}
                            disabled
                            className="form-input disabled"
                          />
                          <p className="lock-message">
                            🔒 Your ward has been assigned by admin and cannot
                            be changed
                          </p>
                        </div>
                      ) : (
                        <input
                          type="text"
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      )}
                    </div>

                    <div className="form-actions">
                      <button
                        className="btn-secondary"
                        onClick={handleCancelClick}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-primary"
                        onClick={handleSaveClick}
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Full Name</label>
                      <p>{user?.name || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Email</label>
                      <p>{user?.email || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone Number</label>
                      <p>{user?.phone || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Occupation</label>
                      <p>{user?.occupation || "N/A"}</p>
                    </div>
                    <div className="detail-item full-width">
                      <label>Address</label>
                      <p>
                        {user?.municipality || "Kathmandu Metropolitan City"},{" "}
                        {user?.ward || "Ward No. 1"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="content-card">
              <div className="card-header">
                <h2>Activity History</h2>
              </div>
              <div className="card-body">
                {/* Recent Comments/Reviews Section - ready for backend API integration */}
                <div className="activities-list">
                  <div className="activity-item">
                    <div className="activity-left">
                      <span className="activity-icon blue-bg">📝</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Submitted a Complaint:{" "}
                          <strong>Road Repair Needed</strong>
                        </div>
                        <div className="activity-desc">
                          Status:{" "}
                          <span className="status-badge pending">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">2 hours ago</div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-left">
                      <span className="activity-icon green-bg">⭐</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Reviewed: <strong>Ward Chairperson's Office</strong>
                        </div>
                        <div className="activity-desc">
                          "Dherai ramro service payeo, dhanyabaad!"
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">Yesterday</div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-left">
                      <span className="activity-icon purple-bg">👤</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Followed:{" "}
                          <strong>Ward Chairperson - Kanchha Maharjan</strong>
                        </div>
                        <div className="activity-desc">
                          You are now getting updates from Ward 19.
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">3 days ago</div>
                  </div>

                  <div className="activity-item">
                    <div className="activity-left">
                      <span className="activity-icon orange-bg">💬</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Commented on: <strong>New Park Opening Notice</strong>
                        </div>
                        <div className="activity-desc">
                          "Yasto kaam sabaile garnu parcha."
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">1 week ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="content-card">
              <div className="card-header">
                <h2>Preferences</h2>
              </div>
              <div className="card-body">
                <p>Preferences settings coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSection;
