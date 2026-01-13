import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { API_ENDPOINTS } from "../config/api";
import "./AdminComplaints.css";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

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
          if (data.success && Array.isArray(data.data)) {
            setComplaints(data.data);
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
                        {complaint.municipality
                          ? `${complaint.municipality}${
                              complaint.ward_number
                                ? `, Ward ${complaint.ward_number}`
                                : ""
                            }`
                          : complaint.ward_number
                          ? `Ward ${complaint.ward_number}`
                          : "N/A"}
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        {complaint.status !== "Resolved" && (
                          <button
                            className="action-btn"
                            onClick={() =>
                              handleStatusChange(complaint.id, "Resolved")
                            }
                          >
                            Resolve
                          </button>
                        )}
                        <button className="action-btn view">View</button>
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
      </div>
    </AdminLayout>
  );
};

export default AdminComplaints;
