import React, { useState } from "react";
import "./Preferences.css";

const Preferences = ({ preferences = {} }) => {
  const [emailNotifications] = useState(
    preferences.emailNotifications || false
  );
  const [smsNotifications] = useState(preferences.smsNotifications || false);

  const handleEmailToggle = () => {
    // Currently disabled - backend not ready
    // setEmailNotifications(!emailNotifications);
    // onUpdate({ ...preferences, emailNotifications: !emailNotifications });
  };

  const handleSmsToggle = () => {
    // Currently disabled - backend not ready
    // setSmsNotifications(!smsNotifications);
    // onUpdate({ ...preferences, smsNotifications: !smsNotifications });
  };

  return (
    <div className="preferences-container">
      <h3>Notification Preferences</h3>

      <div className="service-status-message">
        <span className="status-icon">ℹ️</span>
        <p>Currently unable this services</p>
      </div>

      <div className="preference-item">
        <div className="preference-info">
          <label htmlFor="email-notifications">Email Notifications</label>
          <p className="preference-description">
            Receive notifications via email for important updates
          </p>
        </div>
        <label className="toggle-switch disabled">
          <input
            type="checkbox"
            id="email-notifications"
            checked={emailNotifications}
            onChange={handleEmailToggle}
            disabled
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="preference-item">
        <div className="preference-info">
          <label htmlFor="sms-notifications">SMS Notifications</label>
          <p className="preference-description">
            Receive notifications via SMS for urgent alerts
          </p>
        </div>
        <label className="toggle-switch disabled">
          <input
            type="checkbox"
            id="sms-notifications"
            checked={smsNotifications}
            onChange={handleSmsToggle}
            disabled
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="preferences-note">
        <p>
          <strong>Note:</strong> These notification services will be available
          once backend integration is complete. Contact your administrator for
          more information.
        </p>
      </div>
    </div>
  );
};

export default Preferences;
