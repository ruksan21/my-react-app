import React, { useState, useEffect } from "react";
import OfficerLayout from "../Layout/OfficerLayout";
import { useAuth } from "../../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import "./OfficerDashboard.css";

const OfficerDashboard = () => {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [wardExists, setWardExists] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Pending Complaints", value: "0", icon: "📢", color: "#e53e3e" },
    { label: "Total Budget", value: "Rs. 0", icon: "💰", color: "#38a169" },
    { label: "Total Projects", value: "0", icon: "🏗️", color: "#3182ce" },
    { label: "Ongoing Projects", value: "0", icon: "🚧", color: "#d69e2e" },
    { label: "Completed Projects", value: "0", icon: "✅", color: "#38a169" },
  ]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentWorks, setRecentWorks] = useState([]);

  // Check if officer's assigned ward exists and fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user && user.role === "officer" && workLocation) {
        setIsLoading(true);
        try {
          // 1. Verify Ward and Get Ward Stats
          const wardRes = await fetch(
            `${API_ENDPOINTS.wards.verifyAccess}?province=${encodeURIComponent(
              workLocation.work_province,
            )}&district=${encodeURIComponent(
              workLocation.work_district,
            )}&municipality=${encodeURIComponent(
              workLocation.work_municipality,
            )}&ward_number=${workLocation.work_ward}`,
          );
          const wardData = await wardRes.json();
          setWardExists(wardData.exists || false);

          if (wardData.exists && wardData.ward_id) {
            // Fetch detailed stats (Projects, Budget, etc.)
            try {
              const statsRes = await fetch(
                `${API_ENDPOINTS.stats.getProfileStats}?ward_id=${wardData.ward_id}`,
              );
              const statsData = await statsRes.json();

              const formattedBudget = statsData.totalBudget
                ? `Rs. ${Number(statsData.totalBudget).toLocaleString()}`
                : "Rs. 0";

              setStats([
                {
                  label: "Pending Complaints",
                  value: "...",
                  icon: "📢",
                  color: "#e53e3e",
                },
                {
                  label: "Total Budget",
                  value: formattedBudget,
                  icon: "💰",
                  color: "#38a169",
                },
                {
                  label: "Total Projects",
                  value: (statsData.totalWorks || 0).toString(),
                  icon: "🏗️",
                  color: "#3182ce",
                },
                {
                  label: "Ongoing Projects",
                  value: (statsData.ongoingWorks || 0).toString(),
                  icon: "🚧",
                  color: "#d69e2e",
                },
                {
                  label: "Completed Projects",
                  value: (statsData.completedWorks || 0).toString(),
                  icon: "✅",
                  color: "#38a169",
                },
              ]);
            } catch (err) {
              console.error("Error fetching stats:", err);
            }

            // Fetch recent works
            try {
              const worksParams = new URLSearchParams({
                work_province: workLocation.work_province,
                work_district: workLocation.work_district,
                work_municipality: workLocation.work_municipality,
                work_ward: String(workLocation.work_ward || ""),
              });
              const worksRes = await fetch(
                `${API_ENDPOINTS.works.getAll}?${worksParams.toString()}`,
              );
              const worksData = await worksRes.json();
              if (worksData.success) {
                setRecentWorks(worksData.data.slice(0, 5) || []);
              }
            } catch (err) {
              console.error("Error fetching works:", err);
            }
          }

          // Fetch complaints
          const params = new URLSearchParams({
            province: workLocation.work_province,
            municipality: workLocation.work_municipality,
            ward: workLocation.work_ward,
            source: "citizen",
          }).toString();

          const complaintsRes = await fetch(
            `${API_ENDPOINTS.communication.getComplaints}?${params}`,
          );
          const complaintsData = await complaintsRes.json();

          if (complaintsData.success && Array.isArray(complaintsData.data)) {
            const allComplaints = complaintsData.data;
            const pendingCount = allComplaints.filter(
              (c) => c.status === "Open",
            ).length;

            setRecentComplaints(allComplaints.slice(0, 5));
            setStats((prev) =>
              prev.map((s) =>
                s.label === "Pending Complaints"
                  ? { ...s, value: pendingCount.toString() }
                  : s,
              ),
            );
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user, workLocation]);

  return (
    <OfficerLayout title="Ward Overview">
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

      {isLoading ? (
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Fetching dynamic data...</p>
        </div>
      ) : (
        <>
          <div className="dashboard-stats-grid">
            {stats.map((stat, index) => (
              <div
                className="dashboard-stat-card"
                key={index}
                style={{
                  "--stat-color": stat.color,
                  "--stat-bg": stat.color + "15",
                }}
              >
                <span className="dashboard-stat-label">
                  <span className="icon-wrapper">{stat.icon}</span>
                  {stat.label}
                </span>
                <span className="dashboard-stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="dashboard-main-grid">
            <div className="dashboard-section recent-complaints">
              <div className="section-header">
                <h2 className="section-title">📢 Recent Complaints</h2>
                <a href="/officer/complaints" className="view-all-link">
                  View All
                </a>
              </div>
              <div className="data-list">
                {recentComplaints.length === 0 ? (
                  <div className="empty-mini">No recent complaints found.</div>
                ) : (
                  recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="mini-card complaint">
                      <div className="mini-card-header">
                        <span
                          className={`mini-status status-${(
                            complaint.status || "open"
                          ).toLowerCase()}`}
                        >
                          {complaint.status || "Open"}
                        </span>
                        <span className="mini-date">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="mini-title">
                        {(
                          complaint.subject || complaint.complaint_text
                        ).substring(0, 50)}
                        ...
                      </h4>
                      <p className="mini-subtitle">
                        By: {complaint.first_name} {complaint.last_name}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="dashboard-section recent-works">
              <div className="section-header">
                <h2 className="section-title">🏗️ Latest Projects</h2>
                <a href="/officer/works" className="view-all-link">
                  View All
                </a>
              </div>
              <div className="data-list">
                {recentWorks.length === 0 ? (
                  <div className="empty-mini">No works found.</div>
                ) : (
                  recentWorks.map((work) => (
                    <div key={work.id} className="mini-card work">
                      <div className="mini-card-header">
                        <span
                          className={`mini-status status-${(
                            work.status || "pending"
                          )
                            .replace(/-/g, "")
                            .toLowerCase()}`}
                        >
                          {work.status}
                        </span>
                        <span className="mini-budget">
                          Rs. {Number(work.budget).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="mini-title">{work.title}</h4>
                      <div className="mini-progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width:
                              (work.status || "")
                                .toLowerCase()
                                .replace(/-/g, "") === "completed"
                                ? "100%"
                                : (work.status || "")
                                      .toLowerCase()
                                      .replace(/-/g, "") === "ongoing"
                                  ? "50%"
                                  : "10%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </OfficerLayout>
  );
};

export default OfficerDashboard;
