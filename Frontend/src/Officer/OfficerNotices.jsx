import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerNotices.css";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

const OfficerNotices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notices from backend
  useEffect(() => {
    if (user?.assigned_ward) {
      fetchNotices();
    }
  }, [user]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.alerts.manageNotices}?ward_id=${user.assigned_ward}`
      );
      const result = await response.json();

      if (result.success) {
        setNotices(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        API_ENDPOINTS.alerts.manageNotices,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ward_id: user.assigned_ward,
            officer_id: user.id,
            title: formData.title,
            content: formData.content,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        setFormData({ title: "", content: "" });
        setShowForm(false);
        fetchNotices(); // Reload notices
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        const response = await fetch(
          API_ENDPOINTS.alerts.manageNotices,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }
        );

        const result = await response.json();
        if (result.success) {
          fetchNotices(); // Reload notices
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("Failed to delete notice");
      }
    }
  };

  return (
    <OfficerLayout title="Notices">
      <div className="recent-activity">
        <div className="notices-header">
          <h2 className="section-title">Ward Notices</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-notice-btn"
          >
            <span>{showForm ? "✕" : "+"}</span>{" "}
            {showForm ? "Cancel" : "Create Notice"}
          </button>
        </div>

        {showForm && (
          <div className="notice-form-container">
            <h3 className="notice-form-title">New Notice</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter notice title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-input"
                  placeholder="Enter notice content"
                />
              </div>
              <button type="submit" className="publish-btn">
                Publish Notice
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="no-notices">Loading notices...</div>
        ) : (
          <div className="notices-list">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-card">
                <div className="notice-header">
                  <div>
                    <h3 className="notice-title">{notice.title}</h3>
                    <p className="notice-date">
                      📅 Published on {notice.published_date}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="notice-delete-btn"
                  >
                    Delete
                  </button>
                </div>
                <p className="notice-content">{notice.content}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notices.length === 0 && (
          <div className="no-notices">
            No notices published yet. Click "Create Notice" to add one.
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerNotices;
