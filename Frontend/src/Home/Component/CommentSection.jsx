import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import "./CommentSection.css";

const CommentSection = ({ workId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [notification, setNotification] = useState(null); // Replaced with toast
  const [errors, setErrors] = useState({});

  // Interaction States
  const [activeReplyId, setActiveReplyId] = useState(null); // ID of comment being replied to
  const [replies, setReplies] = useState({}); // Map of feedback_id -> array of replies
  const [replyText, setReplyText] = useState(""); // Current reply input text
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({}); // Toggle visibility of replies

  const fetchComments = useCallback(() => {
    if (workId) {
      const userParam = user?.id ? `&user_id=${user.id}` : "";
      fetch(
        `${API_ENDPOINTS.communication.getFeedback}?work_id=${workId}${userParam}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setComments(data.comments || []);
          }
        })
        .catch((err) => console.error("Error fetching comments:", err));
    }
  }, [workId, user?.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Notification logic replaced by toast

  // Toggle Reply Input
  const toggleReplyInput = (commentId) => {
    if (activeReplyId === commentId) {
      setActiveReplyId(null);
      setReplyText("");
    } else {
      setActiveReplyId(commentId);
      setReplyText("");
      // Also ensure replies are visible when replying
      if (!expandedReplies[commentId]) {
        toggleViewReplies(commentId);
      }
    }
  };

  // Toggle View Replies
  const toggleViewReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    if (!replies[commentId]) {
      fetchReplies(commentId);
    }
  };

  // Fetch replies
  const fetchReplies = (commentId) => {
    const userParam = user?.id ? `&user_id=${user.id}` : "";
    fetch(
      `${API_ENDPOINTS.communication.getReplies}?feedback_id=${commentId}${userParam}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReplies((prev) => ({
            ...prev,
            [commentId]: data.replies || [],
          }));
        }
      })
      .catch((err) => console.error("Error fetching replies:", err));
  };

  // Handle Vote (Like/Dislike for main comments)
  const handleVote = async (feedbackId, voteType) => {
    if (!user) {
      toast.error("Please login to react.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.communication.toggleVote, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: feedbackId,
          user_id: user.id,
          vote_type: voteType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Optimistic update or refresh
        // We will update local state for immediate feedback
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === feedbackId) {
              return {
                ...c,
                likes: data.likes,
                dislikes: data.dislikes,
                user_vote: data.user_vote,
              };
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Vote error:", error);
    }
  };

  // Handle Reply Vote
  const handleReplyVote = async (commentId, replyId, voteType) => {
    if (!user) {
      toast.error("Please login to react.");
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
          [commentId]: prev[commentId].map((r) =>
            r.id === replyId
              ? {
                  ...r,
                  likes: data.likes,
                  dislikes: data.dislikes,
                  user_vote: data.user_vote,
                }
              : r
          ),
        }));
      }
    } catch (error) {
      console.error("Reply vote error:", error);
    }
  };

  // Submit Reply
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;
    if (!user) {
      toast.error("Please login to reply.");
      return;
    }

    setReplyLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.communication.addReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: commentId,
          user_id: user.id, // Generic user_id
          reply_text: replyText,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Reply posted.");
        setReplyText("");
        setActiveReplyId(null);
        fetchReplies(commentId); // Refresh replies

        // Update reply count locally
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, reply_count: (c.reply_count || 0) + 1 }
              : c
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to post reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  // Main Comment Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast.error("Please login to submit a comment");
      return;
    }

    // Validation
    const newErrors = {};
    if (user.role === "citizen" && rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.communication.addFeedback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_id: workId,
          user_id: user.id,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchComments(); // Reload all
        setRating(0);
        setComment("");
        fetchComments(); // Reload all
        setRating(0);
        setComment("");
        toast.success("Feedback submitted!");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMins = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("en-GB");
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return "https://placehold.co/100x100?text=U";
    if (photoPath.startsWith("http")) return photoPath;
    return `${API_ENDPOINTS.authUploads}/${photoPath}`;
  };

  const renderStars = (currentRating, isInteractive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`${
              star <= (isInteractive ? hoverRating || rating : currentRating)
                ? "fa-solid"
                : "fa-regular"
            } fa-star`}
            style={{
              color: "#f1c40f",
              cursor: isInteractive ? "pointer" : "default",
            }}
            onClick={() => isInteractive && setRating(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
          ></i>
        ))}
      </div>
    );
  };

  return (
    <div className="comment-section-fb">
      {/* Header */}
      <div className="fb-header">
        <h3>User Reviews & Feedback</h3>
        <span className="fb-count">{comments.length} Comments</span>
      </div>

      {/* Write Comment Box */}
      <div className="fb-composer">
        {!user ? (
          <div className="fb-login-prompt">
            <p onClick={() => (window.location.href = "/login")}>
              Log in to join the discussion
            </p>
          </div>
        ) : (
          <div className="fb-composer-inner">
            <img
              src={getPhotoUrl(user.photo || user.photoUrl)}
              alt="User"
              className="fb-avatar"
            />
            <div className="fb-input-wrapper">
              {user.role === "citizen" && (
                <div className="fb-rating-select">
                  {renderStars(rating, true)}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <textarea
                  className="fb-textarea"
                  placeholder={
                    user.role === "officer"
                      ? "Write an official update..."
                      : "Write a public comment..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={comment ? 3 : 1}
                />
                {
                  /* Only show submit button if typing */
                  (comment.length > 0 || rating > 0) && (
                    <div className="fb-actions">
                      {errors.comment && (
                        <span className="fb-error">{errors.comment}</span>
                      )}
                      {errors.rating && (
                        <span className="fb-error">{errors.rating}</span>
                      )}
                      <button
                        type="submit"
                        className="fb-submit-btn"
                        disabled={loading}
                      >
                        {loading ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  )
                }
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Main Comments List */}
      <div className="fb-comments-list">
        {comments.map((c) => (
          <div key={c.id} className="fb-comment-card">
            <div className="fb-comment-row">
              <img
                src={getPhotoUrl(c.user_photo)}
                alt={c.user_name}
                className="fb-avatar-small"
              />
              <div className="fb-bubble-container">
                <div className="fb-bubble">
                  <div className="fb-user-name">
                    {c.user_name}
                    {c.user_role === "officer" && (
                      <span className="fb-badge-official">Official</span>
                    )}
                    {c.rating > 0 && (
                      <span className="fb-rating-tag">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`${
                              c.rating > i ? "fa-solid" : "fa-regular"
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
                  <div className="fb-text">{c.comment}</div>
                </div>
                {/* Action Bar */}
                <div className="fb-action-bar">
                  <button
                    className={`fb-action-btn ${
                      c.user_vote === 1 ? "active" : ""
                    }`}
                    onClick={() => handleVote(c.id, 1)}
                  >
                    Like {c.likes > 0 && `(${c.likes})`}
                  </button>
                  <button
                    className={`fb-action-btn ${
                      c.user_vote === -1 ? "active" : ""
                    }`}
                    onClick={() => handleVote(c.id, -1)}
                  >
                    Dislike {c.dislikes > 0 && `(${c.dislikes})`}
                  </button>
                  <button
                    className="fb-action-btn"
                    onClick={() => toggleReplyInput(c.id)}
                  >
                    Reply
                  </button>
                  <span className="fb-timestamp">
                    {formatDate(c.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Reply Input */}
            {activeReplyId === c.id && (
              <div className="fb-reply-input-row">
                <img
                  src={getPhotoUrl(user?.photo || user?.photoUrl)}
                  alt="Me"
                  className="fb-avatar-xs"
                />
                <div className="fb-reply-box">
                  <input
                    type="text"
                    autoFocus
                    placeholder={`Reply to ${c.user_name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleReplySubmit(c.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleReplySubmit(c.id)}
                    disabled={!replyText.trim() || replyLoading}
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Legacy Reply Support */}
            {c.reply_text && (
              <div className="fb-nested-replies">
                <div className="fb-reply-card">
                  <img
                    src="https://placehold.co/100x100?text=O"
                    alt="Official"
                    className="fb-avatar-xs"
                  />
                  <div className="fb-reply-bubble">
                    <div className="fb-reply-content">
                      <span className="fb-reply-user">
                        Official Response{" "}
                        <i className="fas fa-check-circle fb-verified-icon"></i>
                      </span>
                      <span className="fb-reply-text">{c.reply_text}</span>
                    </div>
                    {c.replied_at && (
                      <div className="fb-reply-meta">
                        {formatDate(c.replied_at)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {c.reply_count > 0 && (
              <div className="fb-nested-replies">
                {/* If not expanded, show "View X replies" */}
                {!expandedReplies[c.id] ? (
                  <div
                    className="fb-view-replies"
                    onClick={() => toggleViewReplies(c.id)}
                  >
                    <i className="fa-solid fa-share"></i> View {c.reply_count}{" "}
                    replies
                  </div>
                ) : (
                  /* Expanded List */
                  <div className="fb-replies-list">
                    {(replies[c.id] || []).map((r) => (
                      <div key={r.id} className="fb-reply-card">
                        <img
                          src={getPhotoUrl(r.user_photo)}
                          alt={r.user_name}
                          className="fb-avatar-xs"
                        />
                        <div className="fb-reply-bubble">
                          <div className="fb-reply-content">
                            <span className="fb-reply-user">
                              {r.user_name}
                              {r.user_role === "officer" && (
                                <i
                                  className="fas fa-check-circle fb-verified-icon"
                                  title="Official"
                                ></i>
                              )}
                            </span>
                            <span className="fb-reply-text">
                              {r.reply_text}
                            </span>
                          </div>
                          <div className="fb-reply-meta">
                            <button
                              className={`fb-reply-action-btn ${
                                r.user_vote === 1 ? "active" : ""
                              }`}
                              onClick={() => handleReplyVote(c.id, r.id, 1)}
                            >
                              Like {r.likes > 0 && `(${r.likes})`}
                            </button>
                            <button
                              className={`fb-reply-action-btn ${
                                r.user_vote === -1 ? "active" : ""
                              }`}
                              onClick={() => handleReplyVote(c.id, r.id, -1)}
                            >
                              Dislike {r.dislikes > 0 && `(${r.dislikes})`}
                            </button>
                            <button
                              className="fb-reply-action-btn"
                              onClick={() => toggleReplyInput(c.id)}
                            >
                              Reply
                            </button>
                            <span className="fb-reply-time">
                              {formatDate(r.created_at)}
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
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
