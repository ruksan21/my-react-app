import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../config/api";
import "./AdminComplaints.css";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    // Fetch specific Admin complaints or all complaints if needed
    // For now, mocking or fetching all if API supports it
    const fetchComplaints = async () => {
      try {
        const res = await fetch(
          `${API_ENDPOINTS.communication.getComplaints}?source=admin_view`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.complaints)) {
            setComplaints(data.complaints);
          }
        }
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic update
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    try {
      await fetch(API_ENDPOINTS.communication.updateComplaintStatus, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update status on server", error);
      // Revert if needed, but for now just logging
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesFilter = filter === "All" || complaint.status === filter;
    const matchesSearch =
      complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.complainant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout title="Complaints Management">
      <div className="complaints-container">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search complaints..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="In Progress">In Progress</option>
          </select>
        </div>

        <div className="complaints-table-container">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Subject</th>
                <th>Complainant</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td>#{complaint.id}</td>
                    <td>{complaint.subject}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {complaint.complainant}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span style={{ fontSize: "0.85rem", color: "#6366f1" }}>
                          📍{" "}
                          {complaint.municipality
                            ? `${complaint.municipality}${
                                complaint.ward_number
                                  ? ` - Ward ${complaint.ward_number}`
                                  : ""
                              }`
                            : complaint.ward_number
                            ? `Ward ${complaint.ward_number}`
                            : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`priority-badge priority-${
                          complaint.priority?.toLowerCase() || "medium"
                        }`}
                      >
                        {complaint.priority || "Medium"}
                      </span>
                    </td>
                    <td>
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          complaint.status?.toLowerCase() || "pending"
                        }`}
                      >
                        {complaint.status || "Open"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <select
                          className="status-change-select"
                          value={""}
                          onChange={(e) =>
                            handleStatusChange(complaint.id, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Action
                          </option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolve</option>
                          <option value="Rejected">Reject</option>
                        </select>
                        <button
                          className="action-btn view"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "32px" }}
                  >
                    No complaints found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* DETAILS MODAL */}
        {selectedComplaint && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedComplaint(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Complaint Details</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedComplaint(null)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <div className="detail-row">
                  <strong>Reference ID:</strong> #{selectedComplaint.id}
                </div>
                <div className="detail-row">
                  <strong>Date:</strong>{" "}
                  {new Date(selectedComplaint.created_at).toLocaleString()}
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      selectedComplaint.status?.toLowerCase() || "pending"
                    }`}
                  >
                    {selectedComplaint.status || "Open"}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Priority:</strong> {selectedComplaint.priority}
                </div>

                <hr className="modal-divider" />

                <div className="detail-row">
                  <strong>Complainant:</strong> {selectedComplaint.complainant}
                </div>
                <div className="detail-row">
                  <strong>Location:</strong>{" "}
                  {selectedComplaint.municipality || "N/A"}{" "}
                  {selectedComplaint.ward_number
                    ? `- Ward ${selectedComplaint.ward_number}`
                    : ""}
                </div>

                <hr className="modal-divider" />

                <div className="detail-section">
                  <h3>Subject: {selectedComplaint.subject}</h3>
                  <p className="complaint-message">
                    {selectedComplaint.message}
                  </p>
                </div>

                {/* You could add logs or reply history here */}
              </div>
              <div className="modal-footer">
                <button
                  className="modal-action-btn close"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
