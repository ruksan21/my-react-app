import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerProfile.css";

const OfficerProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    bio: "",
    photo: null,
  });
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const wardId = user?.ward || 1; // Default to 1 if missing

  useEffect(() => {
    // Fetch current data
    fetch(
      `http://127.0.0.1/my-react-app/Backend/api/get_chairperson_profile.php?ward_id=${wardId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const d = data.data;
          setFormData({
            name: d.chairperson_name || "",
            phone: d.chairperson_phone || "",
            email: d.chairperson_email || "",
            bio: d.chairperson_bio || "",
            photo: null,
          });
          if (d.chairperson_photo) {
            setCurrentPhoto(
              `http://127.0.0.1/my-react-app/Backend/api/uploads/${d.chairperson_photo}`
            );
          }
        }
      });
  }, [wardId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const data = new FormData();
    data.append("ward_id", wardId);
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("bio", formData.bio);
    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      const res = await fetch(
        "http://127.0.0.1/my-react-app/Backend/api/update_chairperson_profile.php",
        {
          method: "POST",
          body: data,
        }
      );
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Update current photo preview if new one uploaded
        if (preview) setCurrentPhoto(preview);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Update failed.",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OfficerLayout title="Edit Profile">
      <div className="profile-edit-container">
        {message && (
          <div className={`status-message ${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Photo Upload Section */}
          <div className="photo-section">
            <div className="photo-container">
              <img
                src={
                  preview || currentPhoto || "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="profile-img"
              />
            </div>
            <label className="change-photo-label">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="save-btn">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </OfficerLayout>
  );
};

export default OfficerProfile;
