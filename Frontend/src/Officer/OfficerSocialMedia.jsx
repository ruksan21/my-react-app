import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./OfficerSocialMedia.css";

export default function OfficerSocialMedia() {
  const { getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();

  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
  });

  const [lastUpdated, setLastUpdated] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchSocialLinks = async () => {
    try {
      const params = new URLSearchParams({
        province: workLocation.work_province,
        district: workLocation.work_district,
        municipality: workLocation.work_municipality,
        ward: workLocation.work_ward,
      });

      const response = await fetch(
        `${API_ENDPOINTS.socialMedia.get}?${params}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSocialLinks({
          facebook: data.data.facebook || "",
          instagram: data.data.instagram || "",
          twitter: data.data.twitter || "",
          whatsapp: data.data.whatsapp || "",
        });
        setLastUpdated(data.data.updated_at);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  useEffect(() => {
    if (workLocation) {
      fetchSocialLinks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workLocation]);

  const handleChange = (e) => {
    setSocialLinks({
      ...socialLinks,
      [e.target.name]: e.target.value,
    });
  };

  const handleSmartSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(API_ENDPOINTS.socialMedia.update, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province: workLocation.work_province,
          district: workLocation.work_district,
          municipality: workLocation.work_municipality,
          ward: workLocation.work_ward,
          facebook: socialLinks.facebook,
          instagram: socialLinks.instagram,
          twitter: socialLinks.twitter,
          whatsapp: socialLinks.whatsapp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Social media links updated successfully!",
        });
        await fetchSocialLinks(); // Refresh to get new timestamp
        setTimeout(() => setIsModalOpen(false), 1500); // Close modal on success
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to update links",
        });
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      setMessage({
        type: "error",
        text: "Failed to update social media links",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const platforms = [
    {
      key: "facebook",
      name: "Facebook",
      icon: "📘",
      url: socialLinks.facebook,
    },
    {
      key: "instagram",
      name: "Instagram",
      icon: "📷",
      url: socialLinks.instagram,
    },
    {
      key: "twitter",
      name: "X (Twitter)",
      icon: "🐦",
      url: socialLinks.twitter,
    },
    {
      key: "whatsapp",
      name: "WhatsApp",
      icon: "💬",
      url: socialLinks.whatsapp,
    },
  ];

  return (
    <OfficerLayout title="Social Media Links">
      <div className="social-media-container">
        <div className="page-header">
          <div className="header-content">
            <p className="page-description">
              Manage your ward's social media presence.
            </p>
          </div>
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> Update Links
          </button>
        </div>

        <div className="table-container">
          <table className="social-media-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Link URL</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform.key}>
                  <td>
                    <span className="platform-icon">{platform.icon}</span>
                    {platform.name}
                  </td>
                  <td>
                    {platform.url ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noreferrer"
                        className="table-link"
                      >
                        {platform.url}
                      </a>
                    ) : (
                      <span className="no-link">Not Configured</span>
                    )}
                  </td>
                  <td>{lastUpdated ? getTimeAgo(lastUpdated) : "-"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        platform.url ? "active" : "inactive"
                      }`}
                    >
                      {platform.url ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Update Social Media Links</h2>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {message.text && (
                  <div className={`message-banner ${message.type}`}>
                    {message.text}
                  </div>
                )}

                <form
                  onSubmit={handleSmartSubmit}
                  className="social-modal-form"
                >
                  <div className="form-group">
                    <label>
                      <span className="social-icon">📘</span> Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={socialLinks.facebook}
                      onChange={handleChange}
                      placeholder="https://www.facebook.com/yourpage"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="social-icon">📷</span> Instagram URL
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={socialLinks.instagram}
                      onChange={handleChange}
                      placeholder="https://www.instagram.com/yourpage"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="social-icon">🐦</span> X (Twitter) URL
                    </label>
                    <input
                      type="url"
                      name="twitter"
                      value={socialLinks.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/yourpage"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <span className="social-icon">💬</span> WhatsApp URL
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={socialLinks.whatsapp}
                      onChange={handleChange}
                      placeholder="https://wa.me/97798..."
                      className="form-control"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsModalOpen(false)}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
}
