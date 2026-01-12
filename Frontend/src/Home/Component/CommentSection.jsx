import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import "./CommentSection.css";

const CommentSection = ({ workId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState({});
  const [replyLoading, setReplyLoading] = useState({});

  useEffect(() => {
    if (workId) {
      fetch(`${API_ENDPOINTS.communication.getFeedback}?work_id=${workId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setComments(data.comments || []);
          }
        })
        .catch((err) => console.error("Error fetching comments:", err));
    }
  }, [workId]);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle expanded comment
  const toggleExpandComment = (commentId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));

    // Load replies if not already loaded
    if (!replies[commentId] && expandedComments[commentId] !== true) {
      fetchReplies(commentId);
    }
  };

  // Fetch replies for a comment
  const fetchReplies = (commentId) => {
    fetch(`${API_ENDPOINTS.communication.getReplies}?feedback_id=${commentId}`)
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

  // Submit reply
  const handleReplySubmit = async (commentId) => {
    const reply = replyText[commentId]?.trim();

    if (!user || user.role !== "officer") {
      showNotification("error", "Only officers can reply");
      return;
    }

    if (!reply || reply.length < 5) {
      showNotification("error", "Reply must be at least 5 characters");
      return;
    }

    setReplyLoading((prev) => ({ ...prev, [commentId]: true }));

    try {
      const response = await fetch(API_ENDPOINTS.communication.addReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: commentId,
          officer_id: user.id,
          reply_text: reply,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("success", "✓ Reply posted successfully!");
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        // Reload replies
        fetchReplies(commentId);
      } else {
        showNotification("error", "Error: " + data.message);
      }
    } catch (err) {
      console.error("Reply error:", err);
      showNotification("error", "Network error. Please try again.");
    } finally {
      setReplyLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      showNotification("error", "Please log in to submit a comment");
      return;
    }

    // Validation
    const newErrors = {};
    if (user.role === "citizen" && rating === 0) {
      newErrors.rating = "Please select a rating";
    }
    if (comment.trim() === "") {
      newErrors.comment = "Please write a comment";
    }
    if (comment.trim().length < 5) {
      newErrors.comment = "Comment must be at least 5 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification("error", "Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.communication.addFeedback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_id: workId,
          user_id: user.id || null,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh comments list
        const updatedRes = await fetch(
          `${API_ENDPOINTS.communication.getFeedback}?work_id=${workId}`
        );
        const updatedData = await updatedRes.json();
        if (updatedData.success) {
          setComments(updatedData.comments || []);
        }

        setRating(0);
        setComment("");
        setErrors({});
        showNotification("success", "✓ Feedback submitted successfully!");
      } else {
        showNotification("error", "Error: " + data.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      showNotification("error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-GB");
  };

  const renderStars = (currentRating, isInteractive = false) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${
              star <= (isInteractive ? hoverRating || rating : currentRating)
                ? "filled"
                : ""
            }`}
            onClick={() => isInteractive && setRating(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="comment-section">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="close-toast">
            ×
          </button>
        </div>
      )}

      <div className="comment-header">
        <h3>Comments & Feedback</h3>
        <span className="comment-count">{comments.length} comments</span>
      </div>

      {/* Comment Form */}
      <div className="comment-form-container">
        {!user ? (
          <div className="login-prompt">
            <p>Login to comment...</p>
            <div className="rating-preview">
              Rating: {renderStars(0, false)}
            </div>
            <p className="login-message">
              Please log in as a Citizen or Officer to join the discussion.
            </p>
          </div>
        ) : user.role !== "citizen" && user.role !== "officer" ? (
          <div className="role-restricted-message">
            <span className="info-icon">ℹ️</span>
            <p>
              Only registered <strong>Citizens</strong> or{" "}
              <strong>Officers</strong> can participate in development work
              discussions.
            </p>
            <p className="sub-text">
              As a {user.role}, you can view all community feedback below.
            </p>
          </div>
        ) : (
          <form className="comment-form" onSubmit={handleSubmit}>
            <div className="user-info">
              <img
                src={user.photoUrl || "/default-avatar.png"}
                alt={user.name}
                className="user-avatar"
              />
              <span className="user-name">
                {user.name}{" "}
                {user.role === "officer" && (
                  <span className="officer-badge">Official</span>
                )}
              </span>
            </div>

            {user.role === "citizen" ? (
              <div className="rating-input">
                <label>
                  Rating:{" "}
                  {rating > 0 && (
                    <span className="rating-value">({rating}/5)</span>
                  )}
                </label>
                {renderStars(rating, true)}
                {errors.rating && (
                  <span className="error-message">{errors.rating}</span>
                )}
              </div>
            ) : (
              <div className="officer-comment-info">
                <p>Posting as Ward Officer</p>
              </div>
            )}

            <div className="textarea-wrapper">
              <textarea
                className={`comment-textarea ${errors.comment ? "error" : ""}`}
                placeholder={
                  user.role === "officer"
                    ? "Write an official update or comment..."
                    : "Write your comment (minimum 10 characters)..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="4"
                maxLength="500"
              />
              <div className="textarea-footer">
                {errors.comment && (
                  <span className="error-message">{errors.comment}</span>
                )}
                <span className="char-counter">{comment.length}/500</span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                "Submit Comment"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-card">
              <div className="comment-user">
                <img
                  src={c.user_photo}
                  alt={c.user_name}
                  className="comment-avatar"
                />
                <div className="comment-user-info">
                  <span className="comment-user-name">
                    {c.user_name}
                    {c.user_role === "officer" && (
                      <span className="officer-badge">Official</span>
                    )}
                  </span>
                  <span className="comment-date">
                    {formatDate(c.created_at)}
                  </span>
                </div>
              </div>
              {c.rating > 0 && (
                <div className="comment-rating">
                  {renderStars(c.rating, false)}
                </div>
              )}
              <p className="comment-text">{c.comment}</p>

              {/* Replies Section */}
              {(replies[c.id]?.length > 0 || user?.role === "officer") && (
                <div className="replies-section">
                  <button
                    className="expand-replies-btn"
                    onClick={() => toggleExpandComment(c.id)}
                  >
                    <span className="reply-toggle-icon">
                      {expandedComments[c.id] ? "💬" : "🗨️"}
                    </span>
                    {replies[c.id]?.length > 0
                      ? `Official Replies (${replies[c.id].length})`
                      : "Add Official Response"}
                    <span
                      className={`reply-arrow ${
                        expandedComments[c.id] ? "up" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {expandedComments[c.id] && (
                    <div className="replies-container">
                      {/* Display existing replies */}
                      {replies[c.id] && replies[c.id].length > 0 && (
                        <div className="replies-list">
                          {replies[c.id].map((reply) => (
                            <div key={reply.id} className="reply-card">
                              <div className="reply-user">
                                <img
                                  src={reply.officer_photo}
                                  alt={reply.officer_name}
                                  className="reply-avatar"
                                />
                                <div className="reply-user-info">
                                  <span className="reply-user-name">
                                    🔸 {reply.officer_name}
                                  </span>
                                  {reply.officer_location && (
                                    <span className="reply-user-location">
                                      {reply.officer_location}
                                    </span>
                                  )}
                                  <span className="reply-date">
                                    {formatDate(reply.created_at)}
                                  </span>
                                </div>
                              </div>
                              <p className="reply-text">{reply.reply_text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply form for officers only */}
                      {user && user.role === "officer" && (
                        <div className="reply-form">
                          <textarea
                            className="reply-textarea"
                            placeholder="Write an official response..."
                            value={replyText[c.id] || ""}
                            onChange={(e) =>
                              setReplyText((prev) => ({
                                ...prev,
                                [c.id]: e.target.value,
                              }))
                            }
                            rows="2"
                            maxLength="300"
                          />
                          <div className="reply-form-footer">
                            <span className="char-counter">
                              {(replyText[c.id] || "").length}/300
                            </span>
                            <button
                              className="reply-submit-btn"
                              onClick={() => handleReplySubmit(c.id)}
                              disabled={replyLoading[c.id]}
                            >
                              {replyLoading[c.id]
                                ? "Posting..."
                                : "Post Response"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
