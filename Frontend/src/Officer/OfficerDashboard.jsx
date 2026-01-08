import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import "./OfficerDashboard.css";

const OfficerDashboard = () => {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [wardExists, setWardExists] = useState(null); // null = checking, true = exists, false = doesn't exist

  // Check if officer's assigned ward exists in the system
  useEffect(() => {
    const checkWardExists = async () => {
      if (user && user.role === "officer" && workLocation) {
        try {
          const response = await fetch(
            `http://localhost/my-react-app/Backend/api/wards/verify_ward_exists.php?province=${encodeURIComponent(
              workLocation.work_province
            )}&district=${encodeURIComponent(
              workLocation.work_district
            )}&municipality=${encodeURIComponent(
              workLocation.work_municipality
            )}&ward_number=${workLocation.work_ward}`
          );
          const data = await response.json();
          setWardExists(data.exists || false);
        } catch (error) {
          console.error("Error checking ward:", error);
          setWardExists(false);
        }
      }
    };

    checkWardExists();
  }, [user, workLocation]);

  const stats = [
    { label: "New Applications", value: "5", icon: "📝" },
    { label: "Pending Complaints", value: "3", icon: "📢" },
    { label: "Ward Population", value: "12,500", icon: "👥" },
  ];

  return (
    <OfficerLayout title="Ward Overview">
      {/* Ward Assignment Badge */}
      {workLocation && (
        <div className="ward-assignment-badge">
          <span className="badge-icon">📍</span>
          <span className="badge-text">
            तपाईंको Assignment:{" "}
            <strong>
              {workLocation.work_municipality}, Ward {workLocation.work_ward}
            </strong>
          </span>
        </div>
      )}

      {!workLocation && (
        <div className="ward-assignment-badge warning">
          <span className="badge-icon">⚠️</span>
          <span className="badge-text">
            Ward assignment पेन्डिङ छ। Admin बाट approval पर्खनुहोस्।
          </span>
        </div>
      )}

      {/* Ward Not Created Warning */}
      {workLocation && wardExists === false && (
        <div
          className="ward-assignment-badge error"
          style={{
            backgroundColor: "#fee2e2",
            borderColor: "#ef4444",
            color: "#991b1b",
            marginTop: "15px",
          }}
        >
          <span className="badge-icon">🚫</span>
          <span className="badge-text">
            <strong>तपाईंको Ward अझै Create भएको छैन!</strong>
            <br />
            Ward {workLocation.work_ward} in {workLocation.work_municipality},{" "}
            {workLocation.work_district} अझै system मा create भएको छैन। तपाईं
            Development Works, Complaints, वा Assets add गर्न सक्नुहुन्न। कृपया
            Admin लाई सम्पर्क गर्नुहोस्।
          </span>
        </div>
      )}

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
