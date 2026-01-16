import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { useWard } from "../Context/WardContext";
import { API_ENDPOINTS } from "../../config/api";
import "./Notification.css";

const Notification = () => {
  const { user } = useAuth();
  const { wardId } = useWard();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    // Avoid fetching if user is not logged in
    if (!user?.id) return;

    // Don't set global loading state on background polls to avoid flickering
    setLoading(true);

    try {
      // Include ward_id in the request if available
      let url = `${API_ENDPOINTS.notifications.get}?user_id=${user.id}`;
      if (wardId) {
        url += `&ward_id=${wardId}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        setNotifications(data.data);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, wardId]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      // Poll every 10 seconds to keep sync
      const intervalId = setInterval(fetchNotifications, 10000);
      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, wardId]);

  const toggleNotification = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    if (!user?.id) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.markAsRead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id, user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.markAllAsRead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const clearAll = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(API_ENDPOINTS.notifications.clear, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "notice":
        return "📢";
      case "complaint":
        return "📝";
      default:
        return "🔔";
    }
  };

  if (!user?.id) return null;

  return (
    <div className="notification-container">
      <button className="notification-btn" onClick={toggleNotification}>
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="notification-overlay"
            onClick={toggleNotification}
          ></div>
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-btn">
                    Mark Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="clear-all-btn">
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="notification-list">
              {loading && notifications.length === 0 ? (
                <div className="loading-notifications">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="no-notif-icon">🔕</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${
                      !notif.read ? "unread" : ""
                    }`}
                    onClick={() => !notif.read && markAsRead(notif.id)}
                  >
                    <div className="notif-icon">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="notif-content">
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    {!notif.read && <div className="unread-dot"></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notification;
