import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./OfficerDashboard.css";

const OfficerDashboard = () => {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [wardExists, setWardExists] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "New Applications", value: "0", icon: "📝" },
    { label: "Pending Complaints", value: "0", icon: "📢" },
    { label: "Ward Population", value: "-", icon: "👥" },
  ]);

  // Check if officer's assigned ward exists and fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user.role === "officer" && workLocation) {
        try {
          // 1. Verify Ward and Get Ward Stats
          const wardRes = await fetch(
            `${API_ENDPOINTS.wards.verifyAccess}?province=${encodeURIComponent(
              workLocation.work_province
            )}&district=${encodeURIComponent(
              workLocation.work_district
            )}&municipality=${encodeURIComponent(
              workLocation.work_municipality
            )}&ward_number=${workLocation.work_ward}`
          );
          const wardData = await wardRes.json();
          setWardExists(wardData.exists || false);

          // 2. Fetch Complaints
          const params = new URLSearchParams({
            province: workLocation.work_province,
            municipality: workLocation.work_municipality,
            ward: workLocation.work_ward,
            source: "citizen",
          }).toString();

          const complaintsRes = await fetch(
            `${API_ENDPOINTS.communication.getComplaints}?${params}`
          );
          const complaintsData = await complaintsRes.json();

          if (Array.isArray(complaintsData)) {
            setComplaints(complaintsData.slice(0, 5)); // Show latest 5

            // 3. Update Stats (using counts from real data)
            const pendingCount = complaintsData.filter(
              (c) => c.status === "Open"
            ).length;
            setStats((prev) => [
              prev[0], // Keep New Applications (static for now)
              { ...prev[1], value: pendingCount.toString() },
              { ...prev[2], value: wardData.population || "12,500" },
            ]);
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user, workLocation]);

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

      {/* Warnings... */}
      {workLocation && wardExists === false && (
        <div className="ward-assignment-badge error">
          <span className="badge-icon">🚫</span>
          <span className="badge-text">
            <strong>तपाईंको Ward अझै Create भएको छैन!</strong>
            <br />
            कृपया Admin लाई सम्पर्क गर्नुहोस्।
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
        <h2 className="section-title">Pending Tasks (Latest Complaints)</h2>
        <div className="tasks-list">
          {loading ? (
            <p>Loading tasks...</p>
          ) : complaints.length === 0 ? (
            <p className="no-data">No pending tasks found.</p>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="task-item">
                <div className="task-info">
                  <h4>{complaint.subject}</h4>
                  <p>
                    Submitted by {complaint.complainant} • {complaint.status}
                  </p>
                </div>
                <button
                  className="task-review-btn"
                  onClick={() => (window.location.href = "/officer/complaints")}
                >
                  Review
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </OfficerLayout>
  );
};

export default OfficerDashboard;
