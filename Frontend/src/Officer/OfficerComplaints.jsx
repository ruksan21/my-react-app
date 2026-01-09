import React, { useState, useEffect } from "react";
import { useAuth } from "../Home/Context/AuthContext";
import OfficerLayout from "./OfficerLayout";
import "./OfficerComplaints.css";
import { API_ENDPOINTS } from "../config/api";

const OfficerComplaints = () => {
  const { user, getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [complaints, setComplaints] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({
    subject: "",
    message: "",
    priority: "Medium",
  });

  const handleResolve = (id) => {
    // Optimistic UI update; also attempt to notify backend to update status.
    setComplaints(
      complaints.map((complaint) =>
        complaint.id === id ? { ...complaint, status: "Resolved" } : complaint
      )
    );

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
      if (res.ok) {
        alert("Report submitted to Admin successfully.");
        setShowReportModal(false);
        setReportData({ subject: "", message: "", priority: "Medium" });
      } else {
        alert("Failed to submit report.");
      }
    } catch {
      alert("Error submitting report.");
    }
  };

  useEffect(() => {
    if (!workLocation) return;

    // Fetch complaints from backend
    (async () => {
      try {
        const params = new URLSearchParams({
          province: workLocation.work_province,
          municipality: workLocation.work_municipality,
          ward: workLocation.work_ward,
          source: "citizen",
        }).toString();

        const res = await fetch(
          `${API_ENDPOINTS.communication.getComplaints}?${params}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setComplaints(data);
      } catch {
        console.warn("Could not fetch complaints from server");
      }
    })();
  }, [workLocation]);

  return (
    <OfficerLayout title="Complaints">
      <div className="recent-activity">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 className="section-title">Citizen Complaints</h2>
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
              <th>Complainant</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => {
              return (
                <tr key={complaint.id}>
                  <td className="complaint-complainant">
                    {complaint.complainant}
                  </td>
                  <td>{complaint.subject}</td>
                  <td>{complaint.date}</td>
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
            })}
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
