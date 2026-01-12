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
  const [reportData, setReportData] = useState({
    subject: "",
    message: "",
    priority: "Medium",
  });

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
      const res = await fetch(
        `${API_ENDPOINTS.communication.submitComplaint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            province: workLocation.work_province,
            municipality: workLocation.work_municipality,
            ward: workLocation.work_ward,
            fullName: user.first_name + " " + (user.last_name || ""),
            userId: user.id,
            subject: reportData.subject,
            message: reportData.message,
            priority: reportData.priority,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Report submitted successfully.");
        setShowReportModal(false);
        setReportData({ subject: "", message: "", priority: "Medium" });
        // Refresh reports if on admin tab
        if (activeTab === "admin") fetchComplaints();
      } else {
        alert(data.message || "Failed to submit report.");
      }
    } catch {
      alert("Error submitting report.");
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
          <button
            className="btn-primary"
            onClick={() => setShowReportModal(true)}
            style={{ fontSize: "0.9rem" }}
          >
            ⚠️ Report to Admin
          </button>
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
                    <td>{complaint.subject}</td>
                    <td>
                      {complaint.date ||
                        new Date(complaint.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          complaint.status === "Resolved" ? "resolved" : "open"
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      {complaint.status === "Open" ? (
                        <button
                          onClick={() => handleResolve(complaint.id)}
                          className="resolve-btn"
                        >
                          Mark as Resolved
                        </button>
                      ) : (
                        <span className="resolved-text">
                          <span>✅</span> Resolved
                        </span>
                      )}
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
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3>Report Issue to Admin</h3>
              <button
                className="close-btn"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleReportSubmit} style={{ marginTop: "20px" }}>
              <div className="form-group">
                <label>Subject</label>
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
                <label>Priority</label>
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
              <div className="form-group">
                <label>Message</label>
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
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", marginTop: "10px" }}
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default OfficerComplaints;
