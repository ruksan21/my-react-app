import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../Home/Context/AuthContext";
import "./Admin.css";
import "./AdminLayout.css";

const AdminLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const [unreadCount, setUnreadCount] = React.useState(0);
  // Import API_ENDPOINTS if not already imported, but AdminLayout usually doesn't need it.
  // We need to import it. Or hardcode for now if import is missing?
  // Wait, I should add the import at the top first if it's missing.
  // Actually, I can use a separate useEffect to fetch count.

  // Fetch unread count
  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        // We need API_ENDPOINTS. If existing file doesn't have it, we must add it.
        // Assuming I will add the import in a separate edit or if I find it.
        // Let's use a dynamic import or assuming 'API_ENDPOINTS' is available from props or context? No.
        // I will assume I need to add the import.
        // For now, let's just use the fetch logic and I will also add the import at the top.
        // Wait, I can't do multiple replace with one tool call easily if I target top and bottom.
        // I'll stick to bottom part first, but let's check imports.
        // Logic:
        const response = await fetch(
          "http://localhost/my-react-app/Backend/api/notifications/get_all_notifications.php?status=unread"
        );
        const data = await response.json();
        if (data.success) {
          // If API returns filtered list, the array length is the count.
          // However get_all_notifications returns "notifications" array.
          setUnreadCount(data.total || data.notifications.length || 0);
        }
      } catch (e) {
        console.error("Failed to fetch notification count", e);
      }
    };

    fetchCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span>🛡️</span> Admin Panel
        </div>
        <nav className="admin-nav">
          <Link
            to="/admin"
            className={`admin-nav-item ${
              location.pathname === "/admin" ? "active" : ""
            }`}
          >
            📊 Dashboard
          </Link>
          <div className="admin-nav-divider"></div>
          <Link to="/" className="admin-nav-item home-link">
            🏠 Go to Home
          </Link>
          <div className="admin-nav-divider"></div>
          <Link
            to="/admin/wards"
            className={`admin-nav-item ${
              isActive("/admin/wards") ? "active" : ""
            }`}
          >
            🏘️ Wards
          </Link>
          <Link
            to="/admin/officers"
            className={`admin-nav-item ${
              isActive("/admin/officers") ? "active" : ""
            }`}
          >
            👮 Officers
          </Link>
          <Link
            to="/admin/users"
            className={`admin-nav-item ${
              isActive("/admin/users") ? "active" : ""
            }`}
          >
            👥 Users
          </Link>

          <Link
            to="/admin/complaints"
            className={`admin-nav-item ${
              isActive("/admin/complaints") ? "active" : ""
            }`}
          >
            💬 Complaints
          </Link>
          <Link
            to="/admin/notifications"
            className={`admin-nav-item ${
              isActive("/admin/notifications") ? "active" : ""
            }`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🔔 Notifications</span>
            {unreadCount > 0 && (
              <span
                className="nav-badge"
                style={{
                  backgroundColor: "#ff4444",
                  color: "white",
                  fontSize: "0.75rem",
                  padding: "2px 6px",
                  borderRadius: "10px",
                  marginLeft: "8px",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/settings"
            className={`admin-nav-item ${
              isActive("/admin/settings") ? "active" : ""
            }`}
          >
            ⚙️ Settings
          </Link>
          <div onClick={logout} className="admin-nav-item logout">
            🚪 Logout
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <h2 className="admin-title">
            {title ||
              (location.pathname === "/admin"
                ? "Dashboard"
                : location.pathname.split("/").pop().charAt(0).toUpperCase() +
                  location.pathname.split("/").pop().slice(1))}
          </h2>

          <div className="admin-user-profile">
            <span>{user?.name || "Admin"}</span>
            <div className="profile-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        <div className="admin-content">{children || <Outlet />}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
