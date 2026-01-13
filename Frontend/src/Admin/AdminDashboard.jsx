import React from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const {
    allUsers,
    pendingOfficers,
    fetchAllUsers,
    fetchPendingOfficers,
    refreshWards,
  } = useAuth();
  // recentComplaints removed as per cleanup request

  // Calculate stats
  // Total users = all roles in users table (admin/officer/citizen)
  const totalUsers = allUsers?.length || 0;
  const activeOfficers =
    allUsers?.filter((u) => u.role === "officer" && u.status === "active")
      ?.length || 0;
  const pendingApps = pendingOfficers?.length || 0;

  // Calculate real trends (New this month)
  const currentMonthIndices = [new Date().getMonth(), new Date().getFullYear()];
  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    // Assuming dateString is "DD/MM/YYYY" or "YYYY-MM-DD" or standard ISO
    const date = new Date(dateString);
    // If invalid date, try parsing manually if format is "DD/MM/YYYY" from some locales
    if (isNaN(date.getTime()) && dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        return (
          d.getMonth() === currentMonthIndices[0] &&
          d.getFullYear() === currentMonthIndices[1]
        );
      }
    }
    return (
      date.getMonth() === currentMonthIndices[0] &&
      date.getFullYear() === currentMonthIndices[1]
    );
  };

  const newUsersThisMonth =
    allUsers?.filter((u) => isThisMonth(u.joinedDate))?.length || 0;

  const newOfficersThisMonth =
    allUsers?.filter(
      (u) =>
        u.role === "officer" &&
        u.status === "active" &&
        isThisMonth(u.joinedDate)
    )?.length || 0;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      trend: `+${newUsersThisMonth} new this month`,
      trendUp: newUsersThisMonth > 0,
      colorClass: "card-blue",
      chartPath: "M0,50 Q20,40 40,50 T80,30 T120,40 T160,20", // Mock visualization curve
    },
    {
      label: "Active Officers",
      value: activeOfficers.toLocaleString(),
      trend: `+${newOfficersThisMonth} new this month`,
      trendUp: newOfficersThisMonth > 0,
      colorClass: "card-green",
      chartPath: "M0,50 Q40,60 80,40 T160,30", // Mock visualization curve
    },
    {
      label: "Pending Applications",
      value: pendingApps.toLocaleString(),
      trend: pendingApps > 0 ? "Action Required" : "All Caught Up",
      trendUp: pendingApps === 0,
      colorClass: "card-purple",
      chartPath: "M0,50 Q30,45 60,55 T100,40 T160,50", // Mock visualization curve
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "20px",
        }}
      >
        <button
          className="btn-refresh-dashboard"
          onClick={async () => {
            const btn = document.querySelector(".btn-refresh-dashboard");
            btn.innerText = "⌛ Refreshing...";
            await Promise.all([
              fetchAllUsers && fetchAllUsers(),
              fetchPendingOfficers && fetchPendingOfficers(),
              refreshWards && refreshWards(),
            ]);
            btn.innerText = "🔄 Refresh";
          }}
          style={{
            padding: "8px 16px",
            background: "rgba(99, 102, 241, 0.1)",
            color: "#6366f1",
            border: "1px solid #6366f1",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🔄 Refresh
        </button>
      </div>
      {/* Premium Stats Grid */}
      <div className="stats-grid-premium">
        {stats.map((stat, index) => (
          <div className={`stat-card-premium ${stat.colorClass}`} key={index}>
            <div className="stat-card-content">
              <h3 className="stat-card-label">{stat.label}</h3>
              <div className="stat-card-value">{stat.value}</div>
              <div
                className={`stat-card-trend ${stat.trendUp ? "up" : "down"}`}
              >
                {stat.trendUp ? "↑" : "↓"} {stat.trend}
              </div>
            </div>
            <div className="stat-card-chart">
              <svg viewBox="0 0 160 60" className="chart-svg">
                <path
                  d={stat.chartPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d={`${stat.chartPath} L160,60 L0,60 Z`}
                  fill="currentColor"
                  opacity="0.1"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Removed Recent Complaints and Quick Actions as per user request */}
    </AdminLayout>
  );
};

export default AdminDashboard;
