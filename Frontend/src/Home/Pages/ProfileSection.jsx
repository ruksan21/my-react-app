import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";

import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import "./ProfileSection.css";

const ProfileSection = () => {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    contact_number: user?.contact_number || user?.phone || "",
    gender: user?.gender || "",
    dob: user?.dob || "",
    occupation: user?.occupation || "",
    province: user?.province || "",
    district: user?.district || "",
    city: user?.city || user?.municipality || "",
    ward_number: user?.ward_number || user?.ward || "",
    citizenship_number: user?.citizenship_number || "",
    bio: user?.chairperson_bio || user?.bio || "",
    photo: null,
    personal_photo: null,
  });
  const [preview, setPreview] = useState(user?.photoUrl || null);
  const [personalPreview, setPersonalPreview] = useState(
    user?.photoUrl || user?.profileImage || null
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files[0]) {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else if (name === "personal_photo" && files[0]) {
      setFormData((prev) => ({ ...prev, personal_photo: files[0] }));
      setPersonalPreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Update Personal Info (update_user.php)
      const userRes = await fetch(API_ENDPOINTS.users.update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...formData,
        }),
      });

      const userData = await userRes.json();

      // 2. Update Personal Photo if selected (update_profile_photo.php)
      if (formData.personal_photo) {
        const photoForm = new FormData();
        photoForm.append("user_id", user.id);
        photoForm.append("profilePhoto", formData.personal_photo);

        await fetch(API_ENDPOINTS.users.updatePhoto, {
          method: "POST",
          body: photoForm,
        });
      }

      // 3. If Officer, Update Official Info (update_chairperson_profile.php)
      if (user.role === "officer") {
        const officerForm = new FormData();
        officerForm.append("ward_id", user.ward_id || user.ward || 1);
        officerForm.append(
          "name",
          `${formData.first_name} ${formData.last_name}`
        );
        officerForm.append("phone", formData.contact_number);
        officerForm.append("email", formData.email);
        officerForm.append("bio", formData.bio);
        if (formData.photo) {
          officerForm.append("photo", formData.photo);
        }

        await fetch(API_ENDPOINTS.officers.updateChairpersonProfile, {
          method: "POST",
          body: officerForm,
        });
      }

      if (userData.success) {
        toast.success("Profile updated successfully!");
        // Refresh session to get latest data including photo URL
        await refreshSession();
        setIsEditing(false);
      } else {
        toast.error(userData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-layout">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="user-profile-summary">
          <div className="profile-avatar-large">
            {personalPreview ? (
              <img
                src={personalPreview}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              user?.name?.charAt(0) || user?.first_name?.charAt(0) || "U"
            )}
          </div>
          <h3>{user?.name || "User Name"}</h3>
          <p className="profile-role">
            {user?.ward ? `Ward No. ${user.ward.replace("Ward ", "")}` : "User"}
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
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>
            <div className="card-body">
              {isEditing ? (
                <form className="profile-edit-form" onSubmit={handleSave}>
                  <div className="details-section">
                    <h4 className="section-label">Basic Information</h4>
                    <div className="edit-grid">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Middle Name</label>
                        <input
                          type="text"
                          name="middle_name"
                          value={formData.middle_name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Profile Picture</label>
                        <div className="photo-upload-container">
                          {personalPreview && (
                            <img
                              src={personalPreview}
                              alt="Profile Preview"
                              className="photo-preview"
                            />
                          )}
                          <input
                            type="file"
                            name="personal_photo"
                            accept="image/*"
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4 className="section-label">
                      Address & Additional Details
                    </h4>
                    <div className="edit-grid">
                      <div className="form-group">
                        <label>Province</label>
                        <input
                          type="text"
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>District</label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Municipality</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Ward No.</label>
                        <input
                          type="number"
                          name="ward_number"
                          value={formData.ward_number}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Citizenship Number</label>
                        <input
                          type="text"
                          name="citizenship_number"
                          value={formData.citizenship_number}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  {user?.role === "officer" && (
                    <div className="details-section">
                      <h4 className="section-label">Official Public Profile</h4>
                      <div className="edit-grid">
                        <div className="form-group full-width">
                          <label>Biography / Message to Citizens</label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tell citizens about your vision and work..."
                          />
                        </div>
                        <div className="form-group">
                          <label>Official Photo</label>
                          <div className="photo-upload-container">
                            {preview && (
                              <img
                                src={preview}
                                alt="Preview"
                                className="photo-preview"
                              />
                            )}
                            <input
                              type="file"
                              name="photo"
                              accept="image/*"
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="edit-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-view-details">
                  <div className="details-section basic-info">
                    <h4 className="section-label">Basic Information</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Full Name</label>
                        <p>
                          {`${user?.first_name || ""} ${
                            user?.middle_name ? user.middle_name + " " : ""
                          }${user?.last_name || ""}`.trim() ||
                            user?.name ||
                            "N/A"}
                        </p>
                      </div>
                      <div className="detail-item">
                        <label>Email</label>
                        <p>{user?.email || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Phone Number</label>
                        <p>{user?.contact_number || user?.phone || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Role</label>
                        <p style={{ textTransform: "capitalize" }}>
                          {user?.role || "Citizen"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <h4 className="section-label">Additional Details</h4>
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Gender</label>
                        <p>{user?.gender || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Date of Birth</label>
                        <p>{user?.dob || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Occupation</label>
                        <p>{user?.occupation || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Province</label>
                        <p>{user?.province || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>District</label>
                        <p>{user?.district || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Municipality</label>
                        <p>{user?.city || user?.municipality || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Ward No.</label>
                        <p>{user?.ward_number || user?.ward || "N/A"}</p>
                      </div>
                      <div className="detail-item">
                        <label>Citizenship Number</label>
                        <p>{user?.citizenship_number || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="content-card">
            <div className="card-header">
              <h2>Notification Settings</h2>
            </div>
            <div className="card-body">
              <div className="notification-settings">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email Notification</h4>
                    <p>Receive notifications via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" disabled />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>SMS Notification</h4>
                    <p>Receive important updates via SMS</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" disabled />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Push Notification</h4>
                    <p>Receive push notifications on your device</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" disabled />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
