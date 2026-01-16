import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import OfficerLayout from "./OfficerLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./OfficerComplaints.css"; // Reuse table styles

export default function OfficerReviews() {
  const { user, getOfficerWorkLocation } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wardId, setWardId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("reply"); // "reply", "view", or "confirm_delete"

  const fetchWardId = useCallback(async () => {
    if (!workLocation) return;
    try {
      const response = await fetch(
        `${API_ENDPOINTS.wards.verifyAccess}?province=${encodeURIComponent(
          workLocation.work_province
        )}&district=${encodeURIComponent(
          workLocation.work_district
        )}&municipality=${encodeURIComponent(
          workLocation.work_municipality
        )}&ward_number=${workLocation.work_ward}`
      );
      const data = await response.json();
      if (data.success && data.ward_id) {
        setWardId(data.ward_id);
      }
    } catch (error) {
      console.error("Error fetching ward ID:", error);
    }
  }, [workLocation]);

  const fetchReviews = useCallback(async () => {
    if (!wardId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.communication.getReviews}?ward_id=${wardId}`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    }
    setLoading(false);
  }, [wardId]);

  useEffect(() => {
    fetchWardId();
  }, [fetchWardId]);

  useEffect(() => {
    if (wardId) {
      fetchReviews();
    }
  }, [wardId, fetchReviews]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReview || !user) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.communication.addReviewReply}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_id: selectedReview.id,
            reply_text: replyText,
            officer_id: user.id,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Reply posted successfully!");
        setReplyText("");
        setIsModalOpen(false);
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("An error occurred");
    }
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      const response = await fetch(API_ENDPOINTS.communication.deleteReview, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: selectedReview.id }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Review deleted successfully");
        setIsModalOpen(false);
        fetchReviews();
      } else {
        toast.error(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("An error occurred while deleting");
    }
  };

  return (
    <OfficerLayout title="Public Reviews">
      <div className="officer-complaints-container">
        <div className="table-header">
          <p>Citizen feedback and ratings for your ward.</p>
        </div>

        <div className="complaints-table-wrapper">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Citizen</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No reviews found for this ward.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "35px",
                            height: "35px",
                            borderRadius: "50%",
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            color: "#4b5563",
                            fontSize: "14px",
                            overflow: "hidden",
                          }}
                        >
                          {review.photo ? (
                            <img
                              src={
                                review.photo.startsWith("http")
                                  ? review.photo
                                  : `${API_ENDPOINTS.authUploads}/${review.photo}`
                              }
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            review.first_name?.[0] || "U"
                          )}
                        </div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span style={{ fontWeight: "600" }}>
                            {[
                              review.first_name,
                              review.middle_name,
                              review.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              textTransform: "capitalize",
                            }}
                          >
                            {review.role || "Citizen"} •{" "}
                            {review.role === "officer"
                              ? `${
                                  review.work_municipality ||
                                  review.city ||
                                  "N/A"
                                }, ${
                                  review.work_district || review.district || ""
                                }`
                              : `${review.city || "N/A"}, ${
                                  review.district || ""
                                }`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
                        {"★".repeat(parseInt(review.rating))}
                        <span style={{ color: "#d1d5db" }}>
                          {"★".repeat(5 - parseInt(review.rating))}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          maxWidth: "300px",
                          fontSize: "0.9rem",
                          color: "#4b5563",
                        }}
                      >
                        {review.comment}
                      </div>
                    </td>
                    <td>{new Date(review.created_at).toLocaleDateString()}</td>
                    <td style={{ minWidth: "150px" }}>
                      <div
                        className="action-buttons-group"
                        style={{ display: "flex", gap: "6px" }}
                      >
                        <button
                          className="action-icon-btn view"
                          title="View Details"
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.reply_text || "");
                            setModalMode("view");
                            setIsModalOpen(true);
                          }}
                        >
                          <span className="icon">🔍</span> <span>View</span>
                        </button>
                        <button
                          className="action-icon-btn reply"
                          title={review.reply_text ? "Edit Reply" : "Reply"}
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyText(review.reply_text || "");
                            setModalMode("reply");
                            setIsModalOpen(true);
                          }}
                        >
                          <span className="icon">💬</span>{" "}
                          <span>{review.reply_text ? "Edit" : "Reply"}</span>
                        </button>
                        <button
                          className="action-icon-btn delete"
                          title="Remove Review"
                          onClick={() => {
                            setSelectedReview(review);
                            setModalMode("confirm_delete");
                            setIsModalOpen(true);
                          }}
                        >
                          <span className="icon">🗑️</span> <span>Remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && selectedReview && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>
                  {modalMode === "view"
                    ? "Review Details"
                    : modalMode === "confirm_delete"
                    ? "Confirm Deletion"
                    : `Reply to ${selectedReview.first_name}'s Review`}
                </h2>
                <button
                  className="close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {modalMode !== "confirm_delete" && (
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      User Comment:
                    </p>
                    <p style={{ margin: "5px 0 0", fontWeight: "500" }}>
                      "{selectedReview.comment}"
                    </p>
                  </div>
                )}

                {modalMode === "confirm_delete" ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div
                      style={{
                        fontSize: "4rem",
                        marginBottom: "15px",
                        animation: "bounce 1s infinite",
                      }}
                    >
                      ⚠️
                    </div>
                    <h3>Are you sure?</h3>
                    <p style={{ color: "#6b7280", margin: "10px 0 25px" }}>
                      This will permanently remove the review and all associated
                      replies. This action cannot be undone.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "15px",
                      }}
                    >
                      <button
                        className="btn-secondary"
                        style={{ padding: "10px 25px" }}
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-danger"
                        style={{
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "10px 25px",
                          borderRadius: "8px",
                          fontWeight: "600",
                        }}
                        onClick={handleDeleteReview}
                      >
                        Yes, Delete It
                      </button>
                    </div>
                  </div>
                ) : modalMode === "view" ? (
                  <div className="view-mode-content">
                    <div className="review-detail-card">
                      <div className="detail-row">
                        <span className="detail-label">Rating:</span>
                        <div style={{ color: "#f59e0b" }}>
                          {"★".repeat(parseInt(selectedReview.rating))}
                          <span style={{ color: "#d1d5db" }}>
                            {"★".repeat(5 - parseInt(selectedReview.rating))}
                          </span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Posted On:</span>
                        <span>
                          {new Date(selectedReview.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="detail-row full-width">
                        <span className="detail-label">Citizen Comment:</span>
                        <div className="detail-value box">
                          {selectedReview.comment}
                        </div>
                      </div>
                      {selectedReview.reply_text && (
                        <div className="detail-row full-width">
                          <span className="detail-label">Your Reply:</span>
                          <div
                            className="detail-value box"
                            style={{
                              backgroundColor: "#f0f9ff",
                              borderLeft: "4px solid #3b82f6",
                            }}
                          >
                            {selectedReview.reply_text}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        marginTop: "20px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        className="btn-secondary"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Close
                      </button>
                      {!selectedReview.reply_text && (
                        <button
                          className="btn-primary"
                          style={{ marginLeft: "10px" }}
                          onClick={() => setModalMode("reply")}
                        >
                          Write a Reply
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReplySubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "15px",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#6b7280",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "10px",
                        }}
                      >
                        Official Response
                      </label>
                      <textarea
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          resize: "none",
                          fontSize: "14px",
                          color: "#374151",
                          minHeight: "120px",
                          backgroundColor: "transparent",
                        }}
                        placeholder="Write an official response..."
                        value={replyText}
                        onChange={(e) => {
                          if (e.target.value.length <= 300) {
                            setReplyText(e.target.value);
                          }
                        }}
                        required
                      ></textarea>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          borderTop: "1px solid #f3f4f6",
                          paddingTop: "10px",
                          marginTop: "5px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                          {replyText.length}/300
                        </span>
                      </div>
                    </div>
                    <div
                      className="modal-actions"
                      style={{ justifyContent: "flex-end", gap: "12px" }}
                    >
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{
                          backgroundColor: "#3b82f6",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          borderRadius: "8px",
                        }}
                      >
                        <span style={{ fontSize: "16px" }}>🚀</span>
                        Post Official Reply
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
}
