import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import "./UserManagement.css";

const UserManagement = () => {
  const { allUsers, deleteUser, contextLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    username: "",
    email: "", // Read-only usually? Or editable?
    role: "",
  });

  useEffect(() => {
    if (allUsers) {
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    }
  }, [allUsers]);

  useEffect(() => {
    let result = users;

    if (roleFilter !== "all") {
      result = result.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
    });
    setIsEditing(true);
  };

  const handleViewClick = (user) => {
    setSelectedUser(user);
    setIsViewing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // In a real app, call API to update user
    // For now, just alert and close
    alert("Update feature would call API here.");
    // Example: await updateUser(selectedUser.id, editForm);
    setIsEditing(false);
    setSelectedUser(null);
  };

  const closeModals = () => {
    setIsEditing(false);
    setIsViewing(false);
    setSelectedUser(null);
  };

  if (contextLoading) return <div>Loading...</div>;

  return (
    <AdminLayout title="User Management">
      {/* View User Modal */}
      {isViewing && selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal-content user-profile-content">
            <div className="profile-header-center">
              <div className="profile-avatar-large">
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <h2 style={{ marginTop: "16px", marginBottom: "4px" }}>
                {selectedUser.username}
              </h2>
              <span
                className={`profile-role-badge role-${selectedUser.role.toLowerCase()}`}
              >
                {selectedUser.role}
              </span>
            </div>

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="detail-label">Email Address</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID</span>
                <span className="detail-value">#{selectedUser.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Joined Date</span>
                <span className="detail-value">
                  {selectedUser.created_at || "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="status-badge-active">Active</span>
              </div>
            </div>

            <div className="user-modal-actions">
              <button onClick={closeModals} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditing && selectedUser && (
        <div className="user-modal-overlay">
          <div className="user-modal-content">
            <div className="user-modal-header">
              <h3 className="user-modal-title">Edit User</h3>
              <button onClick={closeModals} className="user-close-btn">
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="user-form-grid">
              <div>
                <label className="stat-label">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="user-input"
                />
              </div>
              <div>
                <label className="stat-label">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="user-input"
                  style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label className="stat-label">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="user-select"
                >
                  <option value="citizen">Citizen</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="user-modal-actions">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-user">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-actions">
          <h2 className="section-title">All System Users</h2>
          <div className="filter-section">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="role-filter-select"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {filteredUsers.length} users
            </span>
          </div>
        </div>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="table-avatar-circle">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.username}</div>
                        <div className="user-email-text">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        user.role === "admin"
                          ? "approved" /* Reusing established badge classes if possible or new ones */
                          : user.role === "officer"
                          ? "pending"
                          : "rejected" /* Just as fallback, or use custom CSS */
                      }`}
                      style={{
                        /* Overriding with specific colors from CSS if needed, 
                           but for now using existing 'badge' class + creating new if needed.
                           Actually, let's use the explicit role styles from CSS if possible?
                           No, table badges are usually small. Let's keep it simple.
                        */
                        backgroundColor:
                          user.role === "admin"
                            ? "#e0f2fe"
                            : user.role === "officer"
                            ? "#f0fdf4"
                            : "#f3f4f6",
                        color:
                          user.role === "admin"
                            ? "#0284c7"
                            : user.role === "officer"
                            ? "#16a34a"
                            : "#4b5563",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.created_at || "N/A"}</td>
                  <td>
                    <span className="status-badge-active">Active</span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <button
                        className="btn-icon-action"
                        title="View"
                        onClick={() => handleViewClick(user)}
                      >
                        👁️
                      </button>
                      <button
                        className="btn-icon-action"
                        title="Edit"
                        onClick={() => handleEditClick(user)}
                      >
                        ✏️
                      </button>
                      {user.role !== "admin" && (
                        <button
                          className="btn-icon-action btn-icon-delete"
                          title="Delete"
                          onClick={() => handleDelete(user.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
