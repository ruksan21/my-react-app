import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../Context/useLanguage";
import { toNepaliNumber } from "../../data/nepal_locations";
import "./CommentSection.css"; // Reuse the Facebook styles

const ReviewListFB = ({ wardId, refreshTrigger }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isNP = language === "NP";
  const [reviews, setReviews] = useState([]);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const sanitizeName = (name) => {
    if (!name) return "";
    if (/^\s*black\s+black\s*$/i.test(name)) return "";
    return name;
  };

  const getFirstName = (name) => {
    const s = sanitizeName(name);
    return s ? s.split(" ")[0] : "";
  };

  const fetchReviews = useCallback(() => {
    if (wardId) {
      const userParam = user?.id ? `&user_id=${user.id}` : "";
      fetch(
        `${API_ENDPOINTS.communication.getReviews}?ward_id=${wardId}${userParam}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReviews(data.data || []);
          }
        })
        .catch((err) => console.error("Error fetching reviews:", err));
    }
  }, [wardId, user?.id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  const toggleViewReplies = (reviewId) => {
    setExpandedReplies((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
    if (!replies[reviewId]) {
      fetchReplies(reviewId);
    }
  };

  const fetchReplies = (reviewId) => {
    const userParam = user?.id ? `&user_id=${user.id}` : "";
    fetch(
      `${API_ENDPOINTS.communication.getReplies}?review_id=${reviewId}${userParam}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReplies((prev) => ({ ...prev, [reviewId]: data.replies || [] }));
        }
      });
  };

  const handleDeleteReview = async (reviewId) => {
    if (
      !window.confirm(
        isNP
          ? "के तपाईं यो समीक्षा मेटाउन चाहनुहुन्छ?"
          : "Are you sure you want to delete this review?",
      )
    )
      return;
    try {
      const response = await fetch(API_ENDPOINTS.communication.deleteReview, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (replyId, reviewId) => {
    if (
      !window.confirm(
        isNP
          ? "के तपाईं यो जवाफ मेटाउन चाहनुहुन्छ?"
          : "Are you sure you want to delete this reply?",
      )
    )
      return;
    try {
      const response = await fetch(API_ENDPOINTS.communication.deleteReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_id: replyId, user_id: user.id }),
      });
      const data = await response.json();
      if (data.success) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || []).filter(
            (rep) => rep.id !== replyId,
          ),
        }));
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, reply_count: Math.max(0, (r.reply_count || 1) - 1) }
              : r,
          ),
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleUpdateReview = async (reviewId) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(API_ENDPOINTS.communication.updateReview, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          user_id: user.id,
          comment: editText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, comment: editText } : r,
          ),
        );
        setEditingId(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReply = async (replyId, reviewId) => {
    if (!editText.trim()) return;
    try {
      const response = await fetch(API_ENDPOINTS.communication.updateReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply_id: replyId,
          user_id: user.id,
          reply_text: editText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || []).map((rep) =>
            rep.id === replyId ? { ...rep, reply_text: editText } : rep,
          ),
        }));
        setEditingId(null);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    if (!replyText.trim()) return;
    if (!user) {
      alert("Please login to reply.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.communication.addReviewReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          user_id: user.id,
          reply_text: replyText,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReplyText("");
        setActiveReplyId(null);
        fetchReplies(reviewId);
        // Update reply count locally
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, reply_count: (r.reply_count || 0) + 1 }
              : r,
          ),
        );
        // Ensure expanded
        setExpandedReplies((prev) => ({ ...prev, [reviewId]: true }));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return isNP ? "आज" : "Today";
    if (diffDays === 1) return isNP ? "हिजो" : "Yesterday";
    if (diffDays < 7)
      return isNP ? `${toNepaliNumber(diffDays)} दिन अघि` : `${diffDays}d ago`;
    return date.toLocaleDateString(isNP ? "ne-NP" : "en-GB");
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "https://placehold.co/100x100?text=U";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_ENDPOINTS.authUploads}/${photoPath}`;
  };

  return (
    <div className="fb-comments-list">
      <h3>
        {t("profile.reviews_form.recent_title")} (
        {isNP ? toNepaliNumber(reviews.length) : reviews.length})
      </h3>
      {reviews.length === 0 ? (
        <p className="no-comments">{t("profile.reviews_form.no_reviews")}</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="fb-comment-card">
            <div className="fb-comment-row">
              <img
                src={getPhotoUrl(r.photo)}
                alt={r.first_name}
                className="fb-avatar-small"
              />
              <div className="fb-bubble-container">
                <div className="fb-bubble">
                  <div className="fb-user-info-header">
                    <span className="fb-user-name">
                      {r.first_name} {r.last_name}
                    </span>
                    {r.role === "officer" && (
                      <span className="fb-badge-official">
                        <i className="fas fa-check-circle"></i>{" "}
                        {t("profile.reviews_form.official")}
                      </span>
                    )}
                    {r.rating > 0 && (
                      <span className="fb-rating-tag">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`${
                              r.rating > i ? "fa-solid" : "fa-regular"
                            } fa-star`}
                            style={{
                              fontSize: "0.9rem",
                              color: "#f1c40f",
                              marginRight: "2px",
                            }}
                          ></i>
                        ))}
                      </span>
                    )}
                  </div>
                  {editingId === r.id ? (
                    <div className="fb-edit-area">
                      <textarea
                        className="fb-edit-textarea"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                      />
                      <div className="fb-edit-actions">
                        <button
                          className="fb-btn-cancel-edit"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          className="fb-btn-save-edit"
                          onClick={() => handleUpdateReview(r.id)}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="fb-text">{r.comment}</div>
                  )}
                </div>
                {/* Action Bar */}
                <div className="fb-action-bar">
                  <button
                    className="fb-action-btn"
                    onClick={() =>
                      setActiveReplyId(activeReplyId === r.id ? null : r.id)
                    }
                  >
                    {t("profile.reviews_form.reply")}
                  </button>

                  {/* Edit/Delete for Owner or Admin/Officer */}
                  {(user?.id == r.user_id ||
                    user?.role === "admin" ||
                    user?.role === "officer") && (
                    <>
                      {user?.id == r.user_id && (
                        <button
                          className="fb-action-btn"
                          onClick={() => startEditing(r.id, r.comment)}
                        >
                          {t("profile.reviews_form.edit")}
                        </button>
                      )}
                      <button
                        className="fb-action-btn delete-action"
                        onClick={() => handleDeleteReview(r.id)}
                      >
                        {t("profile.reviews_form.delete")}
                      </button>
                    </>
                  )}

                  <span className="fb-timestamp">
                    {formatDate(r.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legacy Reply Support (if exists and hasn't been migrated) */}
            {r.reply_text && !expandedReplies[r.id] && (
              <div className="fb-nested-replies">
                <div className="fb-reply-card">
                  {/* Hardcoded official avatar or fetch? */}
                  <img
                    src="https://placehold.co/100x100?text=O"
                    className="fb-avatar-xs"
                    alt="Official"
                  />
                  <div className="fb-reply-bubble">
                    <div className="fb-reply-content">
                      <span className="fb-reply-user">
                        {t("profile.reviews_form.official_response")}
                        <i className="fas fa-check-circle fb-verified-icon"></i>
                      </span>
                      <span className="fb-reply-text">{r.reply_text}</span>
                    </div>
                    <div className="fb-reply-meta">
                      Legacy Reply • {formatDate(r.replied_at || r.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reply Input */}
            {activeReplyId === r.id && (
              <div className="fb-reply-input-row">
                <img
                  src={getPhotoUrl(user?.photo || user?.photoUrl)}
                  className="fb-avatar-xs"
                  alt="Me"
                />
                <div className="fb-reply-box">
                  <input
                    type="text"
                    autoFocus
                    placeholder={
                      isNP
                        ? `${r.first_name} लाई जवाफ दिनुहोस्...`
                        : `Reply to ${r.first_name}...`
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReplySubmit(r.id);
                    }}
                  />
                  <button onClick={() => handleReplySubmit(r.id)}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {(r.reply_count > 0 || (r.reply_text && expandedReplies[r.id])) && (
              <div className="fb-nested-replies">
                {!expandedReplies[r.id] ? (
                  <div
                    className="fb-view-replies"
                    onClick={() => toggleViewReplies(r.id)}
                  >
                    <i className="fa-solid fa-share"></i>{" "}
                    {t("profile.reviews_form.view_replies").replace(
                      "{count}",
                      isNP ? toNepaliNumber(r.reply_count) : r.reply_count,
                    )}
                  </div>
                ) : (
                  <div className="fb-replies-list">
                    {/* Render Legacy Reply first if expanded */}
                    {r.reply_text && (
                      <div className="fb-reply-card">
                        <img
                          src="https://placehold.co/100x100?text=O"
                          className="fb-avatar-xs"
                          alt="Official"
                        />
                        <div className="fb-reply-bubble">
                          <div className="fb-reply-content">
                            <span className="fb-reply-user">
                              {t("profile.reviews_form.official_response")}{" "}
                              <i className="fas fa-check-circle fb-verified-icon"></i>
                            </span>
                            <span className="fb-reply-text">
                              {r.reply_text}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {(replies[r.id] || []).map((rep) => (
                      <div key={rep.id} className="fb-reply-card">
                        <img
                          src={getPhotoUrl(rep.user_photo)}
                          className="fb-avatar-xs"
                          alt={sanitizeName(rep.user_name) || 'User'}
                        />
                        <div className="fb-reply-bubble">
                          <div className="fb-reply-content">
                            <span className="fb-reply-user">
                              {sanitizeName(rep.user_name) || 'Anonymous'}
                              {rep.user_role === "officer" && (
                                <i className="fas fa-check-circle fb-verified-icon"></i>
                              )}
                            </span>
                            {editingId === rep.id ? (
                              <div className="fb-edit-area">
                                <textarea
                                  className="fb-edit-textarea sm"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  autoFocus
                                />
                                <div className="fb-edit-actions">
                                  <button
                                    className="fb-btn-cancel-edit sm"
                                    onClick={() => setEditingId(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="fb-btn-save-edit sm"
                                    onClick={() =>
                                      handleUpdateReply(rep.id, r.id)
                                    }
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="fb-reply-text">
                                {rep.reply_text}
                              </span>
                            )}
                          </div>
                          <div className="fb-reply-meta">
                            <button
                              className="fb-reply-action-btn"
                              onClick={() =>
                                setActiveReplyId(
                                  activeReplyId === r.id ? null : r.id,
                                )
                              }
                            >
                              {t("profile.reviews_form.reply")}
                            </button>

                            {/* Edit/Delete for Replies */}
                            {(user?.id == rep.user_id ||
                              user?.role === "admin" ||
                              user?.role === "officer") && (
                              <>
                                {user?.id == rep.user_id && (
                                  <button
                                    className="fb-reply-action-btn"
                                    onClick={() =>
                                      startEditing(rep.id, rep.reply_text)
                                    }
                                  >
                                    {t("profile.reviews_form.edit")}
                                  </button>
                                )}
                                <button
                                  className="fb-reply-action-btn delete-action"
                                  onClick={() =>
                                    handleDeleteReply(rep.id, r.id)
                                  }
                                >
                                  {t("profile.reviews_form.delete")}
                                </button>
                              </>
                            )}

                            <span className="fb-reply-time">
                              {formatDate(rep.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewListFB;
