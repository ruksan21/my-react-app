import React from "react";
import "./ActivityHistory.css";

const ActivityHistory = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case "login":
        return "🔐";
      case "profile_update":
        return "✏️";
      case "photo_change":
        return "📷";
      case "password_change":
        return "🔑";
      case "preferences_update":
        return "⚙️";
      default:
        return "📌";
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMs = now - activityTime;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return activityTime.toLocaleDateString("en-GB");
  };

  return (
    <div className="activity-history">
      <h3>Recent Activities</h3>
      {activities.length === 0 ? (
        <div className="no-activities">
          <p>No recent activities</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-details">
                <p className="activity-description">{activity.description}</p>
                <span className="activity-time">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
