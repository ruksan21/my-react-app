import React from "react";
import "./notices-new.css";

const Notices = () => {
  return (
    <div className="notices-redirect-container">
      <div className="notices-redirect-card">
        <div className="redirect-icon">🔔</div>
        <h2>Notice Notifications</h2>
        <p>Important notices are displayed as popup notifications when you visit the chairperson's profile.</p>
        <div className="redirect-info">
          <div className="info-item">
            <span className="info-icon">✨</span>
            <span>Automatic popup display</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📱</span>
            <span>Never miss important updates</span>
          </div>
          <div className="info-item">
            <span className="info-icon">🔄</span>
            <span>Navigate through multiple notices</span>
          </div>
        </div>
        <button 
          className="view-all-notices-btn"
          onClick={() => window.location.href = '/notices'}
        >
          View All Notices Page
        </button>
      </div>
    </div>
  );
};

export default Notices;
