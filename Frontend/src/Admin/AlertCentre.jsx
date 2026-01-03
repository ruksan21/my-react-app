import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../config/api";
import "./AlertCentre.css";

const AlertCentre = () => {
  const [filterType, setFilterType] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_ENDPOINTS.alerts.getAlerts);
      const data = await res.json();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
      // Fallback to empty alerts instead of showing big red error
      setAlerts([]);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts =
    filterType === "all"
      ? alerts
      : alerts.filter((alert) => alert.type === filterType);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(API_ENDPOINTS.alerts.manageAlerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id ? { ...alert, status: "read" } : alert
          )
        );
      }
    } catch (err) {
      console.error("Failed to update alert status:", err);
      alert("Failed to update alert status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const res = await fetch(API_ENDPOINTS.alerts.manageAlerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete alert:", err);
      alert("Failed to delete alert.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all alerts permanently?")) return;
    try {
      const res = await fetch(API_ENDPOINTS.alerts.manageAlerts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      const data = await res.json();
      if (data.success) {
        setAlerts([]);
      }
    } catch (err) {
      console.error("Failed to clear alerts:", err);
      alert("Failed to clear alerts.");
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
      success: "✅",
    };
    return icons[type] || "📢";
  };

  const getAlertColor = (type) => {
    const colors = {
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
      success: "#10b981",
    };
    return colors[type] || "#64748b";
  };

  return (
    <AdminLayout title="Alert Centre">
      <div className="alert-centre-container">
        <div className="alert-header">
          <div>
            <h2 className="alert-title">System Alerts & Notifications</h2>
            <p className="alert-subtitle">
              {isLoading ? "Loading..." : `${alerts.length} total alerts`}
              {!isLoading &&
                alerts.filter((a) => a.status === "unread").length > 0 &&
                ` • ${
                  alerts.filter((a) => a.status === "unread").length
                } unread`}
            </p>
          </div>
          <div className="alert-actions">
            <button
              className="btn-secondary"
              onClick={handleClearAll}
              disabled={alerts.length === 0 || isLoading}
            >
              Clear All
            </button>
          </div>
        </div>

        {error && (
          <div
            className="error-message"
            style={{ color: "red", marginBottom: "1rem" }}
          >
            {error}
          </div>
        )}

        <div className="alert-filters">
          <button
            className={`filter-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All ({alerts.length})
          </button>
          <button
            className={`filter-btn ${filterType === "error" ? "active" : ""}`}
            onClick={() => setFilterType("error")}
          >
            Error ({alerts.filter((a) => a.type === "error").length})
          </button>
          <button
            className={`filter-btn ${filterType === "warning" ? "active" : ""}`}
            onClick={() => setFilterType("warning")}
          >
            Warning ({alerts.filter((a) => a.type === "warning").length})
          </button>
          <button
            className={`filter-btn ${filterType === "info" ? "active" : ""}`}
            onClick={() => setFilterType("info")}
          >
            Info ({alerts.filter((a) => a.type === "info").length})
          </button>
          <button
            className={`filter-btn ${filterType === "success" ? "active" : ""}`}
            onClick={() => setFilterType("success")}
          >
            Success ({alerts.filter((a) => a.type === "success").length})
          </button>
        </div>

        <div className="alerts-list">
          {isLoading ? (
            <div className="no-alerts">
              <p>Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="no-alerts">
              <span style={{ fontSize: "2rem" }}>🎉</span>
              <p>No alerts found</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`alert-item ${alert.status} ${alert.type}`}
                style={{
                  borderLeftColor: getAlertColor(alert.type),
                }}
              >
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="alert-content">
                  <div className="alert-header-row">
                    <h4 className="alert-item-title">{alert.title}</h4>
                    <span className="alert-time">{alert.timestamp}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                  {alert.status === "unread" && (
                    <div className="unread-badge">Unread</div>
                  )}
                </div>
                <div className="alert-actions-row">
                  {alert.status === "unread" && (
                    <button
                      className="action-btn-small"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    className="action-btn-small delete"
                    onClick={() => handleDelete(alert.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AlertCentre;
