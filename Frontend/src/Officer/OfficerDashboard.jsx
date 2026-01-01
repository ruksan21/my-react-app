import React from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerDashboard.css";

const OfficerDashboard = () => {
  const stats = [
    { label: "New Applications", value: "5", icon: "📝" },
    { label: "Pending Complaints", value: "3", icon: "📢" },
    { label: "Ward Population", value: "12,500", icon: "👥" },
  ];

  return (
    <OfficerLayout title="Ward Overview">
      <div className="dashboard-stats-grid">
        {stats.map((stat, index) => (
          <div className="dashboard-stat-card" key={index}>
            <span className="dashboard-stat-label">
              <span>{stat.icon}</span> {stat.label}
            </span>
            <span className="dashboard-stat-value">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="recent-activity">
        <h2 className="section-title">Pending Tasks</h2>
        <div className="tasks-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="task-item">
              <div className="task-info">
                <h4>Citizenship Verification Request</h4>
                <p>Submitted by Ram Kumar • 2 hours ago</p>
              </div>
              <button className="task-review-btn">Review</button>
            </div>
          ))}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default OfficerDashboard;
