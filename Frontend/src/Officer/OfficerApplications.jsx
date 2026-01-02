import React, { useState } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerApplications.css";
import { useAuth } from "../Home/Context/AuthContext";

const OfficerApplications = () => {
  const { pendingOfficers, approveOfficer, rejectOfficer, deleteUser } =
    useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOfficer, setEditingOfficer] = useState(null);

  // Filter officers based on search term
  const filteredOfficers = pendingOfficers.filter(
    (app) =>
      app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.officer_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOfficerName = (officer) => {
    return `${officer.first_name} ${officer.middle_name || ""} ${
      officer.last_name
    }`;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editingOfficer) {
      // We can reuse update_user.php since officers are users
      try {
        const response = await fetch(
          "http://localhost/my-react-app/Backend/api/update_user.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingOfficer),
          }
        );
        const data = await response.json();
        if (data.success) {
          window.location.reload();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Update failed", error);
      }
    }
  };

  const handleDelete = (id) => {
    // Reuse deleteUser from context which calls delete_user.php
    deleteUser(id);
  };

  return (
    <OfficerLayout title="Applications">
      <div className="recent-activity">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 className="section-title">Incoming Applications</h2>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              width: "250px",
            }}
          />
        </div>

        {filteredOfficers.length === 0 ? (
          <div
            className="no-data"
            style={{ padding: "20px", textAlign: "center", color: "#666" }}
          >
            No pending applications.
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Officer ID</th>
                <th>Department</th>
                <th>Ward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.map((app) => (
                <tr key={app.id}>
                  <td className="applicant-name">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {/* Initials Avatar */}
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        {app.first_name?.charAt(0)}
                      </div>
                      {getOfficerName(app)}
                    </div>
                  </td>
                  <td>{app.officer_id}</td>
                  <td>{app.department || "N/A"}</td>
                  <td>{app.assigned_ward || app.ward || "N/A"}</td>
                  <td>
                    <span
                      className={`status-badge ${app.status.toLowerCase()}`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      {/* Approve/Reject */}
                      <button
                        onClick={() => approveOfficer(app.id)}
                        className="action-btn approve"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => rejectOfficer(app.id)}
                        className="action-btn reject"
                        title="Reject"
                      >
                        ✗
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingOfficer(app)}
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#3b82f6",
                          fontSize: "1.2rem",
                          marginLeft: "4px",
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="action-btn delete"
                        style={{
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          fontSize: "1.2rem",
                          marginLeft: "4px",
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Edit Modal - Reusing structure */}
        {editingOfficer && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "24px",
                borderRadius: "12px",
                width: "500px",
                maxWidth: "90%",
              }}
            >
              <h3>Edit Officer Application</h3>
              <form
                onSubmit={handleEditSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                    value={editingOfficer.first_name}
                    onChange={(e) =>
                      setEditingOfficer({
                        ...editingOfficer,
                        first_name: e.target.value,
                      })
                    }
                    placeholder="First Name"
                  />
                  <input
                    style={{
                      flex: 1,
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                    value={editingOfficer.last_name}
                    onChange={(e) =>
                      setEditingOfficer({
                        ...editingOfficer,
                        last_name: e.target.value,
                      })
                    }
                    placeholder="Last Name"
                  />
                </div>
                <input
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  value={editingOfficer.officer_id}
                  onChange={(e) =>
                    setEditingOfficer({
                      ...editingOfficer,
                      officer_id: e.target.value,
                    })
                  }
                  placeholder="Officer ID"
                />
                <input
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  value={editingOfficer.department || ""}
                  onChange={(e) =>
                    setEditingOfficer({
                      ...editingOfficer,
                      department: e.target.value,
                    })
                  }
                  placeholder="Department"
                />
                <input
                  style={{
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                  value={editingOfficer.assigned_ward || ""}
                  onChange={(e) =>
                    setEditingOfficer({
                      ...editingOfficer,
                      assigned_ward: e.target.value,
                    })
                  }
                  placeholder="Assigned Ward"
                />
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEditingOfficer(null)}
                    className="btn-secondary"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      backgroundColor: "transparent",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerApplications;
