import React, { useState, useEffect, useCallback } from "react";
import "./OfficerActivities.css";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../Home/Context/AuthContext";
import OfficerLayout from "./OfficerLayout";

export default function OfficerActivities() {
  const { user, getOfficerWorkLocation } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    activity_date: "",
    activity_time: "",
    icon: "📅",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const workLocation = getOfficerWorkLocation();

  const fetchActivities = useCallback(async () => {
    if (!workLocation) return;
    setLoading(true);
    try {
      const params = new URLSearchParams(workLocation).toString();
      const response = await fetch(`${API_ENDPOINTS.activities.get}?${params}`);
      const data = await response.json();
      if (data.success) {
        setActivities(data.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
    setLoading(false);
  }, [workLocation]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      activity_date: "",
      activity_time: "",
      icon: "📅",
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (activity) => {
    setFormData({
      title: activity.title || "",
      subtitle: activity.subtitle || "",
      description: activity.description || "",
      activity_date: activity.activity_date || "",
      activity_time: activity.activity_time || "",
      icon: activity.icon || "📅",
    });
    setIsEditing(true);
    setEditingId(activity.id);
    setIsModalOpen(true);
    setMessage({ type: "", text: "" });
  };

  const handleSmartSubmit = async (e) => {
    e.preventDefault();
    if (!workLocation) {
      setMessage({ type: "error", text: "Work location not found." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        ...workLocation,
        officer_id: user.id,
      };

      // If editing, add the id
      if (isEditing && editingId) {
        payload.id = editingId;
      }

      const response = await fetch(API_ENDPOINTS.activities.add, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: isEditing ? "Activity updated!" : "Activity added & published!" });
        resetForm();
        fetchActivities();
        setTimeout(() => {
          setIsModalOpen(false);
          setMessage({ type: "", text: "" });
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save activity." });
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(API_ENDPOINTS.activities.delete, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, officer_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        fetchActivities();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <OfficerLayout title="Recent Activities">
      <div className="social-media-container">
        <div className="page-header">
          <div className="header-content">
            <p className="page-description">
              Manage and track ward activities and events.
            </p>
          </div>
          <button
            className="add-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
              setMessage({ type: "", text: "" });
            }}
          >
            <i className="fa-solid fa-plus"></i> Add Activity
          </button>
        </div>

        <div className="table-container">
          <table className="social-media-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Description</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data-cell">
                    No activities found.
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id}>
                    <td>
                      <span className="platform-icon">{act.icon}</span>
                      <strong>{act.title}</strong>
                      <div className="subtitle-text">{act.subtitle}</div>
                    </td>
                    <td>
                      <div className="description-text">
                        {act.description || "-"}
                      </div>
                    </td>
                    <td>
                      <div className="date-time-cell">
                        <span className="date-span">
                          📅 {act.activity_date}
                        </span>
                        {act.activity_time && (
                          <span className="time-span">
                            ⏰ {act.activity_time.substring(0, 5)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(act)}
                          title="Edit Activity"
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(act.id)}
                          title="Delete Activity"
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "2px solid #fee2e2",
                            background: "white",
                            color: "#dc2626",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{isEditing ? "✏️ Edit Activity" : "📅 Add New Activity"}</h2>
                <button
                  className="close-btn"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {message.text && (
                  <div
                    className={`message-banner ${
                      message.text.includes("error") || message.type === "error"
                        ? "error"
                        : "success"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form
                  onSubmit={handleSmartSubmit}
                  className="social-modal-form"
                >
                  <div className="form-group">
                    <label>Activity Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Ward Assembly Meeting"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subtitle / Short Summary</label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleChange}
                      placeholder="e.g. Monthly discussion on development projects"
                      className="form-control"
                    />
                  </div>

                  <div className="form-row-dual">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="activity_date"
                        value={formData.activity_date}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        name="activity_time"
                        value={formData.activity_time}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Icon / Category</label>
                    <select
                      name="icon"
                      value={formData.icon}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="📅">📅 Calendar</option>
                      <option value="🏛️">🏛️ Assembly</option>
                      <option value="📍">📍 Field Visit</option>
                      <option value="📢">📢 Announcement</option>
                      <option value="🚧">🚧 Construction</option>
                      <option value="💧">💧 Water Project</option>
                      <option value="🛣️">🛣️ Road Work</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Full Description (Optional)</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control"
                      rows="3"
                      placeholder="Provide more details about the activity..."
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : isEditing ? "💾 Update Activity" : "📅 Add Activity"}
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
