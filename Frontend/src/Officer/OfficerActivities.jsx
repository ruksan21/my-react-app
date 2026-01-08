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

  const handleSubmit = async (e) => {
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

      const response = await fetch(API_ENDPOINTS.activities.add, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Activity added & published!" });
        setFormData({
          title: "",
          subtitle: "",
          description: "",
          activity_date: "",
          activity_time: "",
          icon: "📅",
        });
        fetchActivities();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to add activity." });
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
      <div className="officer-activities-page">
        <div className="page-description">
          <p>Manage ward activities and events.</p>
        </div>

        {message.text && (
          <div className={`message-banner ${message.type}`}>{message.text}</div>
        )}

        <div className="officer-card">
          <h3>Add New Activity</h3>
        <form onSubmit={handleSubmit} className="officer-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Ward Assembly Meeting"
              required
            />
          </div>
          <div className="form-group">
            <label>Subtitle / Short Desc</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="e.g. Monthly ward assembly meeting completed"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="activity_date"
                value={formData.activity_date}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="activity_time"
                value={formData.activity_time}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Icon (Emoji)</label>
              <select name="icon" value={formData.icon} onChange={handleChange}>
                <option value="📅">📅 Calendar</option>
                <option value="🏛️">🏛️ Assembly</option>
                <option value="📍">📍 Field Visit</option>
                <option value="📢">📢 Announcement</option>
                <option value="🚧">🚧 Construction</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Publishing..." : "Publish Activity"}
          </button>
        </form>
        </div>

        <div className="activities-list-admin">
          <h3>Current Activities</h3>
          {activities.length === 0 && <p>No activities found.</p>}
          {activities.map((act) => (
          <div
            key={act.id}
            className="activity-item-admin"
            style={{
              background: "white",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #eee",
            }}
          >
            <div>
              <strong>
                {act.icon} {act.title}
              </strong>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                {act.subtitle}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#888" }}>
                {act.activity_date} at{" "}
                {act.activity_time ? act.activity_time.substring(0, 5) : ""}
              </div>
            </div>
            <button
              onClick={() => handleDelete(act.id)}
              style={{
                background: "#ffebEE",
                color: "red",
                border: "none",
                padding: "8px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              🗑️
            </button>
          </div>
        ))}
        </div>
      </div>
    </OfficerLayout>
  );
}
