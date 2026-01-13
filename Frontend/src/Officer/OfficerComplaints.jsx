import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Home/Context/AuthContext";
import OfficerLayout from "./OfficerLayout";
import "./OfficerComplaints.css";
import { API_ENDPOINTS } from "../config/api";

const OfficerComplaints = () => {
  const { user, getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("citizen"); // "citizen" or "admin"
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [reportData, setReportData] = useState({
    subject: "",
    message: "",
    priority: "Medium",
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(API_ENDPOINTS.communication.manageComplaints, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchComplaints();
      } else {
        alert(data.message || "Failed to delete.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting report.");
    }
  };

  const handleEdit = (complaint) => {
    setEditingId(complaint.id);
    setReportData({
      subject: complaint.subject,
      message: complaint.message,
      priority: complaint.priority || "Medium",
    });
    setShowReportModal(true);
  };

  const handleResolve = (id) => {
    // Optimistic UI update
    if (activeTab === "citizen") {
      setComplaints(
        complaints.map((complaint) =>
          complaint.id === id ? { ...complaint, status: "Resolved" } : complaint
        )
      );
    } else {
      setReports(
        reports.map((report) =>
          report.id === id ? { ...report, status: "Resolved" } : report
        )
      );
    }

    // Update complaint status in backend
    (async () => {
      try {
        await fetch(API_ENDPOINTS.communication.updateComplaintStatus, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "Resolved" }),
        });
      } catch (err) {
        console.warn("Could not update complaint on server:", err);
      }
    })();
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!workLocation) return;
    try {
      let url = API_ENDPOINTS.communication.submitComplaint;
      let method = "POST";
      let body = {
        province: workLocation.work_province,
        municipality: workLocation.work_municipality,
        ward: workLocation.work_ward,
        fullName: user.first_name + " " + (user.last_name || ""),
        userId: user.id,
        subject: reportData.subject,
        message: reportData.message,
        priority: reportData.priority,
      };

      if (editingId) {
        url = API_ENDPOINTS.communication.manageComplaints;
        method = "PUT";
        body.id = editingId;
      }

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Operation successful.");
        setShowReportModal(false);
        setEditingId(null);
        setReportData({ subject: "", message: "", priority: "Medium" });
        fetchComplaints();
      } else {
        alert(data.message || "Failed to submit report.");
      }
    } catch {
      alert("Error processing request.");
    }
  };

  const fetchComplaints = useCallback(async () => {
    if (!workLocation) return;
    try {
      const queryParams = {
        province: workLocation.work_province,
        municipality: workLocation.work_municipality,
        ward: workLocation.work_ward,
      };

      if (activeTab === "citizen") {
        queryParams.source = "citizen";
      } else {
        queryParams.source = "officer";
        queryParams.user_id = user.id;
      }

      const params = new URLSearchParams(queryParams).toString();

      const res = await fetch(
        `${API_ENDPOINTS.communication.getComplaints}?${params}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        if (activeTab === "citizen") {
          setComplaints(data.data);
        } else {
          setReports(data.data);
        }
      }
    } catch (err) {
      console.warn("Could not fetch complaints/reports from server", err);
    }
  }, [workLocation, activeTab, user.id]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <OfficerLayout title="Complaints">
      <div className="recent-activity">
        <div className="complaints-tabs" style={{ marginBottom: "20px" }}>
          <button
            className={`tab-btn ${activeTab === "citizen" ? "active" : ""}`}
            onClick={() => setActiveTab("citizen")}
          >
            Citizen Complaints
          </button>
          <button
            className={`tab-btn ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            My Reports to Admin
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 className="section-title">
            {activeTab === "citizen"
              ? "Citizen Complaints"
              : "Self Reported Issues"}
          </h2>
          {activeTab === "admin" && (
            <button
              className="btn-primary"
              onClick={() => setShowReportModal(true)}
              style={{ fontSize: "0.9rem" }}
            >
              ⚠️ Report to Admin
            </button>
          )}
        </div>
        <table className="complaints-table">
          <thead>
            <tr>
              <th>{activeTab === "citizen" ? "Complainant" : "Recipient"}</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === "citizen" ? complaints : reports).map(
              (complaint) => {
                return (
                  <tr key={complaint.id}>
                    <td className="complaint-complainant">
                      {activeTab === "citizen"
                        ? complaint.complainant
                        : "System Admin"}
                    </td>
                    <td>
                      <div className="complaint-subject">
                        {complaint.subject}
                      </div>
                      <div className="location-meta">
                        {complaint.province}, {complaint.district_name},{" "}
                        {complaint.municipality}, Ward {complaint.ward_number}
                      </div>
                    </td>
                    <td className="complaint-date">
                      {complaint.created_at
                        ? new Date(complaint.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          activeTab === "admin" &&
                          complaint.status.toLowerCase() === "open"
                            ? "pending"
                            : complaint.status.toLowerCase()
                        }`}
                      >
                        {activeTab === "admin" && complaint.status === "Open"
                          ? "Pending"
                          : complaint.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        {activeTab === "citizen" &&
                          (complaint.status === "Open" ? (
                            <button
                              onClick={() => handleResolve(complaint.id)}
                              className="resolve-btn"
                              title="Resolve"
                            >
                              Mark as Resolved
                            </button>
                          ) : (
                            <span className="resolved-text">
                              <span>✅</span> Resolved
                            </span>
                          ))}

                        {activeTab === "admin" && (
                          <>
                            {complaint.status !== "Resolved" && (
                              <button
                                onClick={() => handleEdit(complaint)}
                                className="edit-btn"
                                title="Edit"
                              >
                                ✏️
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(complaint.id)}
                              className="delete-btn"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
            {(activeTab === "citizen" ? complaints : reports).length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No {activeTab === "citizen" ? "complaints" : "reports"} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content complaint-modal">
            <div className="modal-header">
              <h3>
                {editingId ? "✏️ Edit Report" : "⚠️ Report Issue to Admin"}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowReportModal(false);
                  setEditingId(null);
                  setReportData({
                    subject: "",
                    message: "",
                    priority: "Medium",
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="report-form">
              <div className="form-group">
                <label>
                  <i className="fa-solid fa-heading"></i> Subject
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={reportData.subject}
                  onChange={(e) =>
                    setReportData({ ...reportData, subject: e.target.value })
                  }
                  placeholder="e.g. Budget Issue, System Bug"
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="fa-solid fa-flag"></i> Priority
                </label>
                <div className="select-wrapper">
                  <select
                    className="form-input"
                    value={reportData.priority}
                    onChange={(e) =>
                      setReportData({ ...reportData, priority: e.target.value })
                    }
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>
                  <i className="fa-solid fa-message"></i> Message
                </label>
                <textarea
                  required
                  className="form-input"
                  rows="4"
                  value={reportData.message}
                  onChange={(e) =>
                    setReportData({ ...reportData, message: e.target.value })
                  }
                  placeholder="Describe the issue in detail..."
                ></textarea>
              </div>
              <button type="submit" className="submit-report-btn">
                <span>{editingId ? "Update Report" : "Submit Report"}</span>
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default OfficerComplaints;
