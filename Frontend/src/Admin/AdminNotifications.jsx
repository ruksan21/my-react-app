import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../config/api";
import "./AdminNotifications.css";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system",
    source_province: "",
    source_district: "",
    source_municipality: "",
    source_ward: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.notifications.getAll}?limit=500`
      );
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        calculateStats(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (notifs) => {
    setStats({
      total: notifs.length,
      unread: notifs.filter((n) => n.is_read === 0).length,
      read: notifs.filter((n) => n.is_read === 1).length,
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (filterType !== "all") {
      filtered = filtered.filter((n) => n.type === filterType);
    }

    if (filterStatus === "read") {
      filtered = filtered.filter((n) => n.is_read === 1);
    } else if (filterStatus === "unread") {
      filtered = filtered.filter((n) => n.is_read === 0);
    }

    setFilteredNotifications(filtered);
  }, [notifications, filterType, filterStatus]);

  const handleCreateNotification = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_ENDPOINTS.notifications.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Notification created successfully!");
        setIsCreateModalOpen(false);
        setFormData({
          title: "",
          message: "",
          type: "system",
          source_province: "",
          source_district: "",
          source_municipality: "",
          source_ward: "",
        });
        fetchNotifications();
      } else {
        alert("Failed: " + data.message);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to create notification");
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(API_ENDPOINTS.notifications.manage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.manage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!window.confirm("Mark all notifications as read?")) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.manage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      const data = await response.json();
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
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

  const getTypeIcon = (type) => {
    const icons = {
      notice: "📢",
      complaint: "📝",
      work: "🏗️",
      budget: "💰",
      activity: "📅",
      meeting: "🤝",
      alert: "⚠️",
      system: "🔔",
    };
    return icons[type] || "🔔";
  };

  const getTypeColor = (type) => {
    const colors = {
      notice: "#2196F3",
      complaint: "#FF9800",
      work: "#4CAF50",
      budget: "#9C27B0",
      activity: "#00BCD4",
      meeting: "#FF5722",
      alert: "#F44336",
      system: "#607D8B",
    };
    return colors[type] || "#607D8B";
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
        {/* Header Stats */}
        <div className="notification-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Notifications</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-info">
              <h3>{stats.unread}</h3>
              <p>Unread</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.read}</h3>
              <p>Read</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="notification-controls">
          <div className="filter-controls">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="notice">Notice</option>
              <option value="complaint">Complaint</option>
              <option value="work">Work</option>
              <option value="budget">Budget</option>
              <option value="activity">Activity</option>
              <option value="meeting">Meeting</option>
              <option value="alert">Alert</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-create"
            >
              ➕ Create Notification
            </button>
            <button onClick={handleMarkAllRead} className="btn-mark-all">
              ✓ Mark All Read
            </button>
            <button onClick={handleDeleteAll} className="btn-delete-all">
              🗑️ Delete All
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {isLoading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Notifications Found</h3>
              <p>There are no notifications matching your filters.</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.is_read ? "read" : "unread"
                }`}
              >
                <div
                  className="notification-icon"
                  style={{
                    backgroundColor: getTypeColor(notification.type) + "20",
                    color: getTypeColor(notification.type),
                  }}
                >
                  {getTypeIcon(notification.type)}
                </div>

                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <span className="notification-time">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  {notification.source_municipality && (
                    <div className="notification-source">
                      📍 {notification.source_municipality}
                      {notification.source_ward && ` - Ward ${notification.source_ward}`}
                    </div>
                  )}
                </div>

                <div className="notification-actions">
                  {notification.is_read === 0 && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="btn-read"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="btn-delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create System Notification</h2>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="modal-close"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateNotification}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Notification title"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Notification message"
                  />
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="system">System</option>
                    <option value="notice">Notice</option>
                    <option value="alert">Alert</option>
                    <option value="meeting">Meeting</option>
                    <option value="work">Work</option>
                    <option value="budget">Budget</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Province (Optional)</label>
                    <input
                      type="text"
                      value={formData.source_province}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          source_province: e.target.value,
                        })
                      }
                      placeholder="Province"
                    />
                  </div>

                  <div className="form-group">
                    <label>Municipality (Optional)</label>
                    <input
                      type="text"
                      value={formData.source_municipality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          source_municipality: e.target.value,
                        })
                      }
                      placeholder="Municipality"
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Notification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
