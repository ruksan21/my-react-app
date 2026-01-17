import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../Home/Context/AuthContext";
import OfficerLayout from "./OfficerLayout";
import "./OfficerComplaints.css";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const OfficerComplaints = () => {
  const { user, getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [complaints, setComplaints] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("citizen"); // "citizen" or "admin"
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyData, setReplyData] = useState({
    status: "Open",
    message: "",
  });
  const [isSendingReply, setIsSendingReply] = useState(false);
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
        toast.error(data.message || "Failed to delete.");
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

  const directStatusUpdate = async (complaint, status) => {
    // Optimistic UI update for immediate feedback
    const updateState = (prev) =>
      prev.map((c) => (c.id === complaint.id ? { ...c, status } : c));
    setComplaints(updateState);
    setReports(updateState);

    try {
      const res = await fetch(API_ENDPOINTS.communication.sendReplyEmail, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaint_id: complaint.id,
          status: status,
          officer_message: "",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Server error (${res.status}): ${errorText.substring(0, 100)}`
        );
      }

      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Failed to update status on server.");
        fetchComplaints();
      } else {
        // Build a helpful message based on email status
        let msg = `Status updated to ${status}!`;
        if (data.email_sent) {
          msg += "\n✅ Notification email sent to citizen.";
          toast.success(msg);
        } else {
          msg += `\n⚠️ ${data.message}`;
          toast.warning(msg);
        }
        fetchComplaints();
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error(`Update Failed: ${err.message}`);
      fetchComplaints();
    }
  };

  const handleOpenView = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const handleOpenReply = (complaint, preSelectedStatus = null) => {
    // If no preSelectedStatus is passed, use the current status of the complaint
    const targetStatus = preSelectedStatus || complaint.status || "Open";

    setSelectedComplaint(complaint);
    setReplyData({
      status: targetStatus,
      message: "",
      attachment: null,
    });
    setShowReplyModal(true);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSendingReply(true);
    try {
      const formData = new FormData();
      formData.append("complaint_id", selectedComplaint.id);
      formData.append("status", replyData.status);
      formData.append("officer_message", replyData.message);
      if (replyData.attachment) {
        formData.append("attachment", replyData.attachment);
      }

      const res = await fetch(API_ENDPOINTS.communication.sendReplyEmail, {
        method: "POST",
        body: formData, // FormData doesn't need Content-Type header
      });

      const data = await res.json();
      if (data.success) {
        let msg = "Operation successful!";
        if (data.email_sent) {
          msg = "Reply and notification email sent successfully!";
          toast.success(msg);
        } else {
          msg = `Status updated, but email not sent: ${data.message}`;
          toast.warning(msg);
        }
        setShowReplyModal(false);
        fetchComplaints();
      } else {
        toast.error(data.message || "Failed to send reply.");
      }
    } catch (err) {
      console.error("Reply error:", err);
      toast.error("Error sending reply.");
    } finally {
      setIsSendingReply(false);
    }
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
        toast.success(data.message || "Operation successful.");
        setShowReportModal(false);
        setEditingId(null);
        setReportData({ subject: "", message: "", priority: "Medium" });
        fetchComplaints();
      } else {
        toast.error(data.message || "Failed to submit report.");
      }
    } catch {
      toast.error("Error processing request.");
    }
  };

  const fetchComplaints = useCallback(async () => {
    if (!workLocation) return;
    try {
      const queryParams = {
        ward_id: workLocation.work_ward_id,
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
                      <div className="name-box">
                        {activeTab === "citizen"
                          ? complaint.complainant ||
                            (complaint.first_name
                              ? `${complaint.first_name} ${complaint.last_name}`
                              : "Guest User")
                          : "System Admin"}
                      </div>
                      <div
                        className="contact-info-small"
                        style={{
                          fontSize: "0.75rem",
                          color: "#888",
                          marginTop: "4px",
                        }}
                      >
                        {activeTab === "citizen" && (
                          <>
                            {/* Use complaint's own contact info if available (for guests), otherwise use joined user info */}
                            <div>
                              {complaint.complainant_email ||
                                complaint.email ||
                                ""}
                            </div>
                            <div>
                              {complaint.complainant_phone ||
                                complaint.contact_number ||
                                ""}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="complaint-subject">
                        {complaint.subject}
                      </div>
                    </td>
                    <td
                      className="complaint-date"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {complaint.created_at || complaint.date
                        ? new Date(
                            complaint.created_at || complaint.date
                          ).toLocaleString("en-US", {
                            timeZone: "Asia/Kathmandu",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className={`status-badge-big ${(
                          complaint.status || "Open"
                        ).toLowerCase()}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {complaint.status || "Open"}
                      </span>
                    </td>
                    <td>
                      <div
                        className="action-btns"
                        style={{ flexWrap: "wrap", gap: "8px" }}
                      >
                        {activeTab === "citizen" ? (
                          <>
                            <button
                              onClick={() => handleOpenView(complaint)}
                              className="view-btn-new"
                              title="View Details"
                            >
                              View
                            </button>

                            {(complaint.status || "Open").toLowerCase() ===
                              "open" ||
                            (complaint.status || "").toLowerCase() ===
                              "pending" ? (
                              <>
                                <button
                                  onClick={() =>
                                    directStatusUpdate(complaint, "Resolved")
                                  }
                                  className="accept-btn"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() =>
                                    directStatusUpdate(complaint, "Pending")
                                  }
                                  className="pending-btn-action"
                                >
                                  Pending
                                </button>
                                <button
                                  onClick={() =>
                                    directStatusUpdate(complaint, "Rejected")
                                  }
                                  className="reject-btn"
                                >
                                  Reject
                                </button>
                              </>
                            ) : null}

                            <button
                              onClick={() => handleOpenReply(complaint)}
                              className="send-msg-btn"
                            >
                              Send Message
                            </button>
                          </>
                        ) : (
                          <>
                            {complaint.status !== "Resolved" && (
                              <button
                                onClick={() => handleEdit(complaint)}
                                className="edit-btn"
                                title="Edit"
                              >
                                <i className="fa-solid fa-pen"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(complaint.id)}
                              className="delete-btn"
                              title="Delete"
                            >
                              <i className="fa-solid fa-trash"></i>
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
                  <i className="fa-solid fa-pen-nib"></i> Subject
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
                  <i className="fa-solid fa-comment-dots"></i> Message
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
      {showViewModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content complaint-modal view-modal">
            <div className="modal-header">
              <h3>👁️ Complaint Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-content">
              {/* Top Meta Info Grid */}
              <div className="details-grid">
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-heading"></i> Subject
                  </label>
                  <span>{selectedComplaint.subject}</span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-user"></i> Complainant
                  </label>
                  <span>
                    {selectedComplaint.complainant ||
                      (selectedComplaint.first_name
                        ? `${selectedComplaint.first_name} ${selectedComplaint.last_name}`
                        : "Guest")}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-envelope"></i> Email
                  </label>
                  <span>
                    {selectedComplaint.complainant_email ||
                      selectedComplaint.email ||
                      "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-phone"></i> Contact
                  </label>
                  <span>
                    {selectedComplaint.complainant_phone ||
                      selectedComplaint.contact_number ||
                      "N/A"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-calendar"></i> Submitted Date
                  </label>
                  <span>
                    {selectedComplaint.date ||
                      (selectedComplaint.created_at
                        ? new Date(
                            selectedComplaint.created_at
                          ).toLocaleString()
                        : "N/A")}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-layer-group"></i> Locality
                  </label>
                  <span>
                    Ward {selectedComplaint.ward_number},{" "}
                    {selectedComplaint.municipality}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-flag"></i> Priority
                  </label>
                  <div>
                    <span
                      className={`priority-badge-big ${selectedComplaint.priority}`}
                    >
                      {selectedComplaint.priority}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <label>
                    <i className="fa-solid fa-circle-info"></i> Status
                  </label>
                  <div>
                    <span
                      className={`status-badge-big ${selectedComplaint.status.toLowerCase()}`}
                    >
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Section */}
              <div className="detail-message-section">
                <h4>
                  <i className="fa-solid fa-message"></i> Complaint Message
                </h4>
                <p>{selectedComplaint.message}</p>
              </div>

              {/* Image Section */}
              {selectedComplaint.image && (
                <div className="detail-attachment-section">
                  <h4>
                    <i className="fa-solid fa-paperclip"></i> Attachment
                  </h4>
                  <div className="image-container">
                    <img
                      src={`${API_BASE_URL}/uploads/complaints/${selectedComplaint.image}`}
                      alt="attachment"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/600x400?text=Image+Not+Found";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content complaint-modal reply-modal">
            <div className="modal-header">
              <h3>✉️ Reply via Email</h3>
              <button
                className="close-btn"
                onClick={() => setShowReplyModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-content" style={{ padding: "30px" }}>
              <div
                style={{
                  marginBottom: "15px",
                  padding: "10px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <strong>To:</strong>{" "}
                {selectedComplaint.complainant_email ||
                  selectedComplaint.email ||
                  "No Email Found"}
              </div>
              <form
                onSubmit={handleReplySubmit}
                className="report-form"
                style={{ padding: 0 }}
              >
                <div className="form-group">
                  <label>Update Status</label>
                  <select
                    className="form-input"
                    value={replyData.status}
                    onChange={(e) =>
                      setReplyData({ ...replyData, status: e.target.value })
                    }
                  >
                    <option value="Open">Keep Open</option>
                    <option value="Pending">Mark as Pending</option>
                    <option value="Resolved">Mark as Resolved</option>
                    <option value="Rejected">Mark as Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Your Message / Response (Optional)</label>
                  <textarea
                    className="form-input"
                    placeholder="Write your reply here..."
                    value={replyData.message}
                    onChange={(e) =>
                      setReplyData({ ...replyData, message: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>
                    <i className="fa-solid fa-paperclip"></i> Include Image /
                    Attachment
                  </label>
                  <input
                    type="file"
                    className="form-input"
                    accept="image/*"
                    onChange={(e) =>
                      setReplyData({
                        ...replyData,
                        attachment: e.target.files[0],
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="submit-report-btn"
                  disabled={isSendingReply}
                >
                  {isSendingReply ? "Sending..." : "Send Reply & Update"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
};

export default OfficerComplaints;
