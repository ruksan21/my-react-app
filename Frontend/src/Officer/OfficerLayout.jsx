import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Admin/Admin.css"; // Reuse styles for consistency
import "./OfficerLayout.css"; // Specific officer styles
import { useAuth } from "../Home/Context/AuthContext";

const OfficerLayout = ({ children, title }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar officer-sidebar">
        <div className="admin-logo">
          <span>👮</span> Officer Panel
        </div>
        <div className="ward-info">
          <div className="location-label">📍 Assigned Location</div>
          <div className="location-detail">
            {user?.province || "Bagmati Province"}
          </div>
          <div className="location-detail">{user?.district || "Kathmandu"}</div>
          <div
            className="location-detail"
            style={{ fontWeight: 600, color: "#3b82f6" }}
          >
            {user?.city || "Kathmandu Metropolitan City"}
          </div>
          <div className="location-ward">
            Ward No. {user?.assigned_ward || user?.ward || "1"}
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
