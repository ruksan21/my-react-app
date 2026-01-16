import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import "./CommentSection.css"; // Reuse the Facebook styles

const ReviewListFB = ({ wardId, refreshTrigger }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  const fetchReviews = useCallback(() => {
    if (wardId) {
      const userParam = user?.id ? `&user_id=${user.id}` : "";
      fetch(
        `${API_ENDPOINTS.communication.getReviews}?ward_id=${wardId}${userParam}`
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
      `${API_ENDPOINTS.communication.getReplies}?review_id=${reviewId}${userParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReplies((prev) => ({ ...prev, [reviewId]: data.replies || [] }));
        }
      });
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      alert("Please login to react.");
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.communication.toggleVote, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: reviewId,
          user_id: user.id,
          vote_type: voteType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  likes: data.likes,
                  dislikes: data.dislikes,
                  user_vote: data.user_vote,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyVote = async (reviewId, replyId, voteType) => {
    if (!user) {
      alert("Please login to react.");
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.communication.toggleVote, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply_id: replyId,
          user_id: user.id,
          vote_type: voteType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReplies((prev) => ({
          ...prev,
          [reviewId]: (prev[reviewId] || []).map((rep) =>
            rep.id === replyId
              ? {
                  ...rep,
                  likes: data.likes,
                  dislikes: data.dislikes,
                  user_vote: data.user_vote,
                }
              : rep
          ),
        }));
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
              : r
          )
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
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB");
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "https://placehold.co/100x100?text=U";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_ENDPOINTS.authUploads}/${photoPath}`;
  };

  return (
    <div className="fb-comments-list">
      <h3>Recent Reviews ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p className="no-comments">No reviews yet.</p>
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
                  <div className="fb-user-name">
                    {r.first_name} {r.last_name}
                    {r.role === "officer" && (
                      <span className="fb-badge-official">Official</span>
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
                              fontSize: "0.8rem",
                              color: "#f1c40f",
                              marginRight: "1px",
                            }}
                          ></i>
                        ))}
                      </span>
                    )}
                  </div>
                  <div className="fb-text">{r.comment}</div>
                </div>
                {/* Action Bar */}
                <div className="fb-action-bar">
                  <button
                    className={`fb-action-btn ${
                      r.user_vote === 1 ? "active" : ""
                    }`}
                    onClick={() => handleVote(r.id, 1)}
                  >
                    Like {r.likes > 0 && `(${r.likes})`}
                  </button>
                  <button
                    className={`fb-action-btn ${
                      r.user_vote === -1 ? "active" : ""
                    }`}
                    onClick={() => handleVote(r.id, -1)}
                  >
                    Dislike {r.dislikes > 0 && `(${r.dislikes})`}
                  </button>
                  <button
                    className="fb-action-btn"
                    onClick={() =>
                      setActiveReplyId(activeReplyId === r.id ? null : r.id)
                    }
                  >
                    Reply
                  </button>
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
                        Official Response
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
                    placeholder={`Reply to ${r.first_name}...`}
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
                    <i className="fa-solid fa-share"></i> View {r.reply_count}{" "}
                    replies
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
                              Official Response{" "}
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
                          alt={rep.user_name}
                        />
                        <div className="fb-reply-bubble">
                          <div className="fb-reply-content">
                            <span className="fb-reply-user">
                              {rep.user_name}
                              {rep.user_role === "officer" && (
                                <i className="fas fa-check-circle fb-verified-icon"></i>
                              )}
                            </span>
                            <span className="fb-reply-text">
                              {rep.reply_text}
                            </span>
                          </div>
                          <div className="fb-reply-meta">
                            <button
                              className={`fb-reply-action-btn ${
                                rep.user_vote === 1 ? "active" : ""
                              }`}
                              onClick={() => handleReplyVote(r.id, rep.id, 1)}
                            >
                              Like {rep.likes > 0 && `(${rep.likes})`}
                            </button>
                            <button
                              className={`fb-reply-action-btn ${
                                rep.user_vote === -1 ? "active" : ""
                              }`}
                              onClick={() => handleReplyVote(r.id, rep.id, -1)}
                            >
                              Dislike {rep.dislikes > 0 && `(${rep.dislikes})`}
                            </button>
                            <button
                              className="fb-reply-action-btn"
                              onClick={() =>
                                setActiveReplyId(
                                  activeReplyId === r.id ? null : r.id
                                )
                              }
                            >
                              Reply
                            </button>
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
