import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (wardId) {
      fetchNotifications();
    }
  }, [wardId]);

  const fetchNotifications = async () => {
    if (!wardId) return;
    
    setLoading(true);
    try {
      // Fetch ward notices as notifications
      const response = await fetch(`${API_ENDPOINTS.alerts.manageNotices}?ward_id=${wardId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Convert notices to notification format
        const noticeNotifications = data.data.map(notice => ({
          id: notice.id,
          title: "📢 New Notice",
          message: notice.title,
          type: 'notice',
          created_at: notice.created_at,
          read: false
        }));
        
        setNotifications(noticeNotifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleNotification = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id) => {
    // Mark notification as read in state
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    // Mark all notifications as read in state
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    // Optionally add API call to delete all notifications
    setNotifications([]);
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "work":
        return "🏗️";
      case "meeting":
        return "📅";
      case "info":
        return "ℹ️";
      case "complaint":
        return "📝";
      default:
        return "🔔";
    }
  };

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
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="clear-all-btn">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
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
                    onClick={() => markAsRead(notif.id)}
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
