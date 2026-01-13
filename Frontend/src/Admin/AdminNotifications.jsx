import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./AdminNotifications.css";

const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
  });

  const fetchNotifications = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.notifications.getAll}?limit=500`
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setStats({ total: data.notifications.length });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(false);

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    let filtered = notifications;
    if (filterType !== "all") {
      if (filterType === "system") {
        filtered = filtered.filter(
          (n) => n.type === "system" || n.origin === "system_alert"
        );
      } else {
        filtered = filtered.filter((n) => n.type === filterType);
      }
    }
    setFilteredNotifications(filtered);
  }, [notifications, filterType]);

  const handleDelete = async (id, origin = "notification") => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.manage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id, origin }),
      });

      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Delete ALL notifications permanently? This cannot be undone!"
      )
    )
      return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.manage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all" }),
      });

      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting all:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.markAllAsRead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, scope: "global" }),
      });
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      notice: "📢",
      work: "🏗️",
      budget: "💰",
      activity: "📅",
      alert: "⚠️",
      system: "🔔",
    };
    return icons[type] || "🔔";
  };

  const getTypeColor = (type) => {
    const colors = {
      notice: "#3b82f6",
      complaint: "#f59e0b",
      work: "#10b981",
      budget: "#8b5cf6",
      activity: "#06b6d4",
      meeting: "#f97316",
      alert: "#ef4444",
      system: "#64748b",
    };
    return colors[type] || "#64748b";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString();
    } else if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <AdminLayout title="System Notifications">
      <div className="admin-notifications-container">
        {/* Controls */}
        <div className="notification-toolbar">
          <div className="filter-group">
            <label>Filter by Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="toolbar-select"
            >
              <option value="all">📁 All Types</option>
              <option value="system">🔔 System</option>
              <option value="notice">📢 Notice</option>

              <option value="work">🏗️ Work</option>
              <option value="budget">💰 Budget</option>
              <option value="activity">📅 Activity</option>
              <option value="alert">⚠️ Alert</option>
            </select>
          </div>

          <div className="toolbar-actions">
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary-outline"
            >
              ✓ Read All
            </button>
            <button
              onClick={handleDeleteAll}
              className="btn-destructive-outline"
            >
              🗑️ Delete All
            </button>
          </div>
        </div>
        <div className="notification-stats-footer">
          <p>
            Total Notifications: <strong>{stats.total}</strong>
          </p>
        </div>

        {/* Notifications List */}
        <div className="notifications-list-premium">
          {isLoading ? (
            <div className="loading-state">Loading records...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>Nothing to show</h3>
              <p>No notifications match the current filters.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={`${notification.origin}-${notification.id}`}
                className="notification-card-premium"
              >
                <div
                  className="card-icon-aside"
                  style={{
                    backgroundColor: getTypeColor(notification.type) + "15",
                    color: getTypeColor(notification.type),
                  }}
                >
                  {getTypeIcon(notification.type)}
                </div>

                <div className="card-body">
                  <div className="card-header-row">
                    <div className="title-area">
                      <h4>{notification.title}</h4>
                      {notification.origin === "system_alert" && (
                        <span className="system-tag">SYSTEM</span>
                      )}
                    </div>
                    <span className="time-stamp">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="message-text">{notification.message}</p>
                  {(notification.source_municipality ||
                    notification.source_ward) && (
                    <div className="location-footer">
                      📍 {notification.source_municipality || "Internal System"}
                      {notification.source_ward &&
                        ` • Ward ${notification.source_ward}`}
                    </div>
                  )}
                </div>

                <div className="card-actions-aside">
                  <button
                    onClick={() =>
                      handleDelete(notification.id, notification.origin)
                    }
                    className="delete-icon-btn"
                    title="Delete Permanently"
                  >
                    🗑️
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

export default AdminNotifications;
