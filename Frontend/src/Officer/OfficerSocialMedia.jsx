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
      
      const response = await fetch(`${API_ENDPOINTS.socialMedia.get}?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setSocialLinks({
          facebook: data.data.facebook || "",
          instagram: data.data.instagram || "",
          twitter: data.data.twitter || "",
          whatsapp: data.data.whatsapp || "",
        });
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

  const handleSubmit = async (e) => {
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
        setMessage({ type: "success", text: "Social media links updated successfully!" });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update links" });
      }
    } catch (error) {
      console.error("Error updating social links:", error);
      setMessage({ type: "error", text: "Failed to update social media links" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OfficerLayout title="Social Media Links">
      <div className="social-media-container">
        <div className="page-description">
          <p>Manage your ward's social media links. These will be displayed on the Contact page.</p>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="social-form-card">
          <form onSubmit={handleSubmit} className="social-media-form">
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
                className="social-input"
              />
              <small className="input-hint">Enter your ward's Facebook page URL</small>
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
                className="social-input"
              />
              <small className="input-hint">Enter your ward's Instagram profile URL</small>
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
                className="social-input"
              />
              <small className="input-hint">Enter your ward's Twitter/X profile URL</small>
            </div>

            <div className="form-group">
              <label>
                <span className="social-icon">💬</span> WhatsApp Number
              </label>
              <input
                type="text"
                name="whatsapp"
                value={socialLinks.whatsapp}
                onChange={handleChange}
                placeholder="https://wa.me/9779851234567"
                className="social-input"
              />
              <small className="input-hint">Enter WhatsApp URL (e.g., https://wa.me/9779851234567)</small>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="save-btn" 
                disabled={loading}
              >
                {loading ? "Saving..." : "💾 Save Social Media Links"}
              </button>
            </div>
          </form>
        </div>

        <div className="preview-section">
          <h3>Preview</h3>
          <p>How your social media buttons will appear:</p>
          <div className="social-preview">
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="preview-btn facebook">
                📘 Facebook
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="preview-btn instagram">
                📷 Instagram
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="preview-btn twitter">
                🐦 X (Twitter)
              </a>
            )}
            {socialLinks.whatsapp && (
              <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" className="preview-btn whatsapp">
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </OfficerLayout>
  );
}
