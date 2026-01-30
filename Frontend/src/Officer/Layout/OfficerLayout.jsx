import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../Admin/Admin.css"; // Reuse styles for consistency
import "./OfficerLayout.css"; // Specific officer styles
import { useAuth } from "../../Home/Context/AuthContext";

const OfficerLayout = ({ children, title }) => {
  const location = useLocation();
  const { logout, user, getOfficerWorkLocation } = useAuth();
  const navigate = useNavigate();
  const workLocation = getOfficerWorkLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Go to Home", icon: "🏠" },
    { path: "/officer", label: "Ward Overview", icon: "📊" },
    { path: "/officer/works", label: "Development Works", icon: "🏗️" },
    { path: "/officer/budgets", label: "Budgets", icon: "💰" },
    { path: "/officer/departments", label: "Departments", icon: "🏢" },
    { path: "/officer/assets", label: "Ward Assets", icon: "📦" },
    { path: "/officer/complaints", label: "Complaints", icon: "📢" },
    { path: "/officer/notices", label: "Notices", icon: "📌" },
    { path: "/officer/activities", label: "Activities", icon: "📅" },
    { path: "/officer/social-media", label: "Social Media", icon: "🌐" },
    { path: "/officer/reviews", label: "Public Reviews", icon: "⭐" },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar officer-sidebar">
        <div className="admin-logo">
          <span>👮</span> Officer Panel
        </div>
        <div className="ward-info">
          <div className="location-label">📍 ASSIGNED LOCATION</div>
          <div className="location-detail">
            {workLocation?.work_province || "Province Not Set"}
          </div>
          <div className="location-detail">
            {workLocation?.work_district || "District Not Set"}
          </div>
          <div
            className="location-detail"
            style={{ fontWeight: 600, color: "#3b82f6" }}
          >
            {workLocation?.work_municipality || "Municipality Not Set"}
          </div>
          <div className="location-ward">
            Ward No. {workLocation?.work_ward || "N/A"}
          </div>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${
                location.pathname === item.path ? "active" : ""
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <div
            className="admin-nav-item logout-nav-item"
            onClick={handleLogout}
          >
            <span>🚪</span> Logout
          </div>
        </nav>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-title">{title}</h1>
          <div className="admin-user-profile">
            <span>Officer: {user?.name || "Officer"}</span>
            <div className="officer-avatar">O</div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default OfficerLayout;
