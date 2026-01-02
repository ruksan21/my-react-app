import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Admin.css";
import "./AdminLayout.css";
import { useAuth } from "../Home/Context/AuthContext";

const AdminLayout = ({ children, title }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Go to Home", icon: "🏠" },
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "User Management", icon: "👥" },
    { path: "/admin/alerts", label: "Alert Centre", icon: "🔔" },
    { path: "/admin/officers", label: "Officer Applications", icon: "👮" },
    { path: "/admin/wards", label: "Ward Management", icon: "🏙️" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>🛡️</span> Admin Panel
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
          <div className="admin-nav-item logout" onClick={handleLogout}>
            <span>🚪</span> Logout
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1 className="admin-title">{title}</h1>
          <div className="admin-user-profile">
            <span>Welcome, {user?.name || "admin"}</span>
            <div className="profile-avatar-circle">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
