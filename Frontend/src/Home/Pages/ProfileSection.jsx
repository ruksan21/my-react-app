import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import NotificationPanel from "../Component/NotificationPanel";
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

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    occupation: "",
    municipality: "",
    ward: "",
  });

  // Initialize form data when user data is available or when entering edit mode
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        occupation: user.occupation || "",
        municipality: user.municipality || "Kathmandu Metropolitan City",
        ward: user.ward || "Ward No. 1",
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
        phone: user.phone || "",
        occupation: user.occupation || "",
        municipality: user.municipality || "Kathmandu Metropolitan City",
        ward: user.ward || "Ward No. 1",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClick = async () => {
    // TODO: Backend integration - Update user profile
    try {
      /* Example API call:
      const response = await fetch('http://localhost/ward-portal/api/update_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Update local context
        updateUser(formData);
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Error: " + data.message);
      }
      */

      // Mock implementation
      // Update user context with new data
      updateUser(formData);

      addNotification("success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification("error", "Failed to update profile.");
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
      // In a real app, upload file here
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profileImage: imageUrl });
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
                          <i className="fa-solid fa-camera"></i>
                          <span>Change Profile Picture</span>
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
                          <p className="lock-message">🔒 Your ward has been assigned by admin and cannot be changed</p>
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
                      >
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleSaveClick}>
                        Save Changes
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
                      <span className="activity-icon">💬</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Commented on: Ward Assembly Meeting
                        </div>
                        <div className="activity-desc">
                          "Ramro kaam gareko cha!"
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">2025/11/23</div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-left">
                      <span className="activity-icon">⭐</span>
                      <div className="activity-texts">
                        <div className="activity-title">
                          Reviewed: Road Construction Progress
                        </div>
                        <div className="activity-desc">
                          4 stars - "Satisfactory work."
                        </div>
                      </div>
                    </div>
                    <div className="activity-date">2025/11/22</div>
                  </div>
                  {/*
                    TODO: Fetch user's recent comments/reviews from backend API
                    Example PHP endpoint: /api/user-activity.php?user_id=USER_ID
                    Map over the returned array to render each activity here.
                  */}
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
