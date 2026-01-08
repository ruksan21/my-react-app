import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import "./Activities.css";
import { useWard } from "../Context/WardContext";
import { API_ENDPOINTS } from "../../config/api";

export default function Activities({ embedded = false }) {
  const { municipality, ward, wardId } = useWard();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wardId) {
      fetchActivities();
    }
  }, [wardId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.activities.get}?ward_id=${wardId}`
      );
      const data = await response.json();
      if (data.success) {
        setActivities(
          data.data.map((a) => ({
            ...a,
            // Map DB fields to UI fields if different
            date: a.activity_date,
            time: a.activity_time ? a.activity_time.substring(0, 5) : "",
            iconBg: a.icon_bg || "#E3F2FD",
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`activities-page ${embedded ? "embedded" : ""}`}>
        {embedded && (
          <div className="embedded-header" style={{ marginBottom: 12 }}>
            <span className="embedded-pin">📍</span>
            <span className="embedded-title">
              {municipality} - Ward {ward}
            </span>
          </div>
        )}
        <div className="section-header">
          <span className="section-pin">🗂️</span>
          <span className="section-title">Recent Activities</span>
        </div>
        <div className="activities-list">
          {activities.length === 0 && !loading && (
            <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
              No activities found.
            </div>
          )}
          {activities.map((act, idx) => (
            <div key={idx} className="activity-item">
              <span
                className="activity-icon"
                style={{ background: act.iconBg }}
              >
                {act.icon}
              </span>
              <div className="activity-content">
                <div className="activity-title">{act.title}</div>
                <div className="activity-subtitle">{act.subtitle}</div>
                <div className="activity-footer">
                  <span className="activity-date">📅 {act.date}</span>
                  <span className="activity-time">🕐 {act.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
