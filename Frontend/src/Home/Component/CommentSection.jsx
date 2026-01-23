import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import "./CommentSection.css";

const CommentSection = ({
  workId,
  initialExpanded = false,
  hideToggle = false,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Editing States
  const [editingId, setEditingId] = useState(null); // ID of comment being edited
  const [editingText, setEditingText] = useState("");
  const [editingReplyId, setEditingReplyId] = useState(null); // ID of reply being edited
  const [editingReplyText, setEditingReplyText] = useState("");

  // Interaction States
  const [activeReplyId, setActiveReplyId] = useState(null); // ID of comment being replied to
  const [replies, setReplies] = useState({}); // Map of feedback_id -> array of replies
  const [replyText, setReplyText] = useState(""); // Current reply input text
  // Reaction Types
  const reactionTypes = [
    { type: "like", icon: "👍", label: "Like", color: "#dab748ff" },
    { type: "love", icon: "❤️", label: "Love", color: "#f33e58" },
    { type: "care", icon: "🥰", label: "Care", color: "#f7b125" },
    { type: "haha", icon: "😆", label: "Haha", color: "#f7b125" },
    { type: "wow", icon: "😮", label: "Wow", color: "#f7b125" },
    { type: "sad", icon: "😢", label: "Sad", color: "#f7b125" },
    { type: "angry", icon: "😡", label: "Angry", color: "#e9710f" },
  ];
  const [replyLoading, setReplyLoading] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({}); // Toggle visibility of replies
  const [showFullSection, setShowFullSection] = useState(initialExpanded); // Toggle the whole section
  const [activeMenuId, setActiveMenuId] = useState(null); // ID of comment whose three-dot menu is open

  // Helper to sanitize display names (remove testing placeholder like 'black black')
  const sanitizeName = (name) => {
    if (!name) return "";
    // Remove exact placeholder 'black black' (case-insensitive)
    if (/^\s*black\s+black\s*$/i.test(name)) return "";
    return name;
  };

  const getFirstName = (name) => {
    const s = sanitizeName(name);
    return s ? s.split(" ")[0] : "";
  };

  const fetchComments = useCallback(() => {
    if (workId) {
      const userParam = user?.id ? `&current_user_id=${user.id}` : "";
      fetch(
        `${API_ENDPOINTS.communication.getFeedback}?work_id=${workId}${userParam}`,
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

  // Handle Delete Comment
  const handleDeleteComment = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      const res = await fetch(API_ENDPOINTS.communication.deleteFeedback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_id: feedbackId, user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Comment deleted.");
        setComments((prev) => prev.filter((c) => c.id !== feedbackId));
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  // Handle Update Comment
  const handleUpdateComment = async (feedbackId) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(API_ENDPOINTS.communication.updateFeedback, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: feedbackId,
          user_id: user.id,
          comment: editingText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Comment updated.");
        setComments((prev) =>
          prev.map((c) =>
            c.id === feedbackId ? { ...c, comment: editingText } : c,
          ),
        );
        setEditingId(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update comment.");
    }
  };

  // Handle Delete Reply
  const handleDeleteReply = async (commentId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await fetch(API_ENDPOINTS.communication.deleteReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_id: replyId, user_id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply deleted.");
        setReplies((prev) => ({
          ...prev,
          [commentId]: prev[commentId].filter((r) => r.id !== replyId),
        }));
        // Update reply count locally
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, reply_count: Math.max(0, (c.reply_count || 0) - 1) }
              : c,
          ),
        );
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

  // Handle Update Reply
  const handleUpdateReply = async (commentId, replyId) => {
    if (!editingReplyText.trim()) return;
    try {
      const res = await fetch(API_ENDPOINTS.communication.updateReply, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply_id: replyId,
          user_id: user.id,
          reply_text: editingReplyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reply updated.");
        setReplies((prev) => ({
          ...prev,
          [commentId]: prev[commentId].map((r) =>
            r.id === replyId ? { ...r, reply_text: editingReplyText } : r,
          ),
        }));
        setEditingReplyId(null);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to update reply.");
    }
  };

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
      `${API_ENDPOINTS.communication.getReplies}?feedback_id=${commentId}${userParam}`,
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
          reaction_type: voteType,
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
                user_reaction: data.user_reaction,
                reaction_breakdown: data.reaction_breakdown,
              };
            }
            return c;
          }),
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
          reaction_type: voteType,
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
                  user_reaction: data.user_reaction,
                  reaction_breakdown: data.reaction_breakdown,
                }
              : r,
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
              : c,
          ),
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
    if (user.role !== "officer" && rating === 0) {
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
              fontSize: isInteractive ? "1.2rem" : "0.8rem",
              color: "#f1c40f",
              cursor: isInteractive ? "pointer" : "default",
              marginLeft: star === 1 ? "0" : "4px",
              marginRight: "4px",
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
    <div
      className={`comment-section-fb ${
        showFullSection ? "section-expanded" : ""
      }`}
    >
      {/* Toggle Header / Tap Area */}
      {!hideToggle && (
        <div
          className="fb-toggle-header"
          onClick={() => setShowFullSection(!showFullSection)}
          title={
            showFullSection
              ? "Click to hide comments"
              : "Click to view comments"
          }
        >
          <div className="toggle-left">
            <i
              className={`fa-solid ${
                showFullSection ? "fa-comments" : "fa-comment"
              }`}
            ></i>
            <span className="toggle-text">
              {showFullSection ? "Hide Comments" : "View Feedback & Comments"}
            </span>
          </div>
          <div className="toggle-right">
            <span className="fb-count">{comments.length} Comments</span>
            <i
              className={`fa-solid fa-chevron-${
                showFullSection ? "up" : "down"
              } ml-2`}
            ></i>
          </div>
        </div>
      )}

      {showFullSection && (
        <div className="fb-content-area">
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
                  {user.role !== "officer" && (
                    <div className="fb-rating-select">
                      <span className="rating-label">Rate this project:</span>
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
                    {(comment.length > 0 || rating > 0) && (
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
                    )}
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Main Comments List - Scrollable */}
          <div className="fb-comments-scroll-area">
            <div className="fb-comments-list">
              {comments.length === 0 ? (
                <div className="fb-empty-state">
                  No comments yet. Be the first to share your feedback!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="fb-comment-card">
                    <div className="fb-comment-row">
                      <img
                        src={getPhotoUrl(c.user_photo)}
                        alt={sanitizeName(c.user_name) || 'User'}
                        className="fb-avatar-small"
                      />
                      <div className="fb-bubble-container">
                        <div className="fb-bubble">
                          <div className="fb-user-name">
                            {sanitizeName(c.user_name) || 'Anonymous'}
                            {c.user_role === "officer" && (
                              <span className="fb-badge-official">
                                Official
                              </span>
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
                                      marginLeft: i === 0 ? "8px" : "2px",
                                      marginRight: "2px",
                                    }}
                                  ></i>
                                ))}
                              </span>
                            )}
                          </div>

                          {editingId === c.id ? (
                            <div className="fb-edit-area">
                              <textarea
                                className="fb-edit-textarea"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                autoFocus
                              />
                              <div className="fb-edit-actions">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="fb-btn-cancel-edit"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleUpdateComment(c.id)}
                                  className="fb-btn-save-edit"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="fb-text">{c.comment}</div>
                          )}
                        </div>
                        {/* Action Bar */}
                        <div className="fb-action-bar">
                          <div className="fb-reaction-wrapper">
                            <div className="fb-reaction-dock">
                              {reactionTypes.map((r) => (
                                <span
                                  key={r.type}
                                  className="reaction-emoji"
                                  onClick={() => handleVote(c.id, r.type)}
                                  data-label={r.label}
                                >
                                  {r.icon}
                                </span>
                              ))}
                            </div>
                            <button
                              className={`fb-action-btn like-btn ${
                                c.user_reaction
                                  ? `reacted type-${c.user_reaction}`
                                  : ""
                              }`}
                              onClick={() =>
                                handleVote(
                                  c.id,
                                  c.user_reaction ? c.user_reaction : "like",
                                )
                              }
                            >
                              {c.user_reaction ? (
                                <>
                                  <span className="current-reaction-icon">
                                    {
                                      reactionTypes.find(
                                        (r) => r.type === c.user_reaction,
                                      )?.icon
                                    }
                                  </span>
                                  <span
                                    className="reaction-label"
                                    style={{
                                      color: reactionTypes.find(
                                        (r) => r.type === c.user_reaction,
                                      )?.color,
                                    }}
                                  >
                                    {
                                      reactionTypes.find(
                                        (r) => r.type === c.user_reaction,
                                      )?.label
                                    }
                                  </span>
                                </>
                              ) : (
                                <span className="reaction-label">Like</span>
                              )}
                            </button>
                          </div>
                          <button
                            className="fb-action-btn"
                            onClick={() => toggleReplyInput(c.id)}
                          >
                            Reply
                          </button>

                          {(user?.id == c.user_id ||
                            user?.role === "officer") && (
                            <div className="fb-more-actions">
                              <button
                                className={`fb-action-btn fb-more-btn ${
                                  activeMenuId === `c-${c.id}` ? "active" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(
                                    activeMenuId === `c-${c.id}`
                                      ? null
                                      : `c-${c.id}`,
                                  );
                                }}
                              >
                                <i className="fa-solid fa-ellipsis"></i>
                              </button>
                              {activeMenuId === `c-${c.id}` && (
                                <div className="fb-actions-dropdown">
                                  {user?.id == c.user_id && (
                                    <button
                                      onClick={() => {
                                        setEditingId(c.id);
                                        setEditingText(c.comment);
                                        setActiveMenuId(null);
                                      }}
                                    >
                                      <i className="fa-solid fa-pen"></i> Edit
                                    </button>
                                  )}
                                  <button
                                    className="delete-action"
                                    onClick={() => {
                                      handleDeleteComment(c.id);
                                      setActiveMenuId(null);
                                    }}
                                  >
                                    <i className="fa-solid fa-trash"></i> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <span className="fb-timestamp">
                            {formatDate(c.created_at)}
                          </span>

                          {c.likes > 0 && (
                            <div className="fb-comment-reaction-summary">
                              <div className="reaction-badges">
                                {c.reaction_breakdown &&
                                Object.keys(c.reaction_breakdown).length > 0 ? (
                                  Object.entries(c.reaction_breakdown)
                                    .filter(([, count]) => count > 0)
                                    .slice(0, 3)
                                    .map(([rt]) => {
                                      const icon = reactionTypes.find(
                                        (r) => r.type === rt,
                                      )?.icon;
                                      return icon ? (
                                        <span
                                          key={rt}
                                          className={`summary-icon badge-${rt}`}
                                        >
                                          {icon}
                                        </span>
                                      ) : null;
                                    })
                                ) : (
                                  <span className="summary-icon badge-like">
                                    👍
                                  </span>
                                )}
                              </div>
                              <span className="summary-count">{c.likes}</span>
                              {/* Reaction Breakdown Tooltip */}
                              <div className="reaction-tooltip">
                                {c.reaction_breakdown ? (
                                  Object.entries(c.reaction_breakdown).map(
                                    ([type, count]) => {
                                      const reaction = reactionTypes.find(
                                        (r) => r.type === type,
                                      );
                                      return count > 0 && reaction ? (
                                        <div
                                          key={type}
                                          className="reaction-breakdown-item"
                                        >
                                          <span className="reaction-icon">
                                            {reaction.icon}
                                          </span>
                                          <span className="reaction-label">
                                            {reaction.label}
                                          </span>
                                          <span className="reaction-count">
                                            {count}
                                          </span>
                                        </div>
                                      ) : null;
                                    },
                                  )
                                ) : (
                                  <div className="reaction-breakdown-item">
                                    <span className="reaction-icon">👍</span>
                                    <span className="reaction-label">Like</span>
                                    <span className="reaction-count">
                                      {c.likes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

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
                              <span className="fb-reply-text">
                                {c.reply_text}
                              </span>
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
                        {!expandedReplies[c.id] ? (
                          <div
                            className="fb-view-replies"
                            onClick={() => toggleViewReplies(c.id)}
                          >
                            <i className="fa-solid fa-share"></i>
                            {c.reply_count === 1
                              ? "View 1 reply"
                              : `View all ${c.reply_count} replies`}
                          </div>
                        ) : (
                          <div className="fb-replies-list">
                            {(replies[c.id] || []).map((r) => (
                              <React.Fragment key={r.id}>
                                <div className="fb-reply-card">
                                  <img
                                    src={getPhotoUrl(r.user_photo)}
                                    alt={sanitizeName(r.user_name) || 'User'}
                                    className="fb-avatar-xs"
                                  />
                                  <div className="fb-reply-bubble">
                                    <div className="fb-reply-content">
                                      <span className="fb-reply-user">
                                        {sanitizeName(r.user_name) || 'Anonymous'}
                                        {r.user_role === "officer" && (
                                          <i
                                            className="fas fa-check-circle fb-verified-icon"
                                            title="Official"
                                          ></i>
                                        )}
                                      </span>

                                      {editingReplyId === r.id ? (
                                        <div className="fb-edit-area">
                                          <textarea
                                            className="fb-edit-textarea sm"
                                            value={editingReplyText}
                                            onChange={(e) =>
                                              setEditingReplyText(
                                                e.target.value,
                                              )
                                            }
                                            autoFocus
                                          />
                                          <div className="fb-edit-actions">
                                            <button
                                              onClick={() =>
                                                setEditingReplyId(null)
                                              }
                                              className="fb-btn-cancel-edit sm"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleUpdateReply(c.id, r.id)
                                              }
                                              className="fb-btn-save-edit sm"
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="fb-reply-text">
                                          {r.reply_text}
                                        </span>
                                      )}
                                    </div>
                                    <div className="fb-reply-meta">
                                      {/* 2. Like Button */}
                                      <div className="fb-reaction-wrapper">
                                        <div className="fb-reaction-dock top-dock">
                                          {reactionTypes.map((rt) => (
                                            <span
                                              key={rt.type}
                                              className="reaction-emoji"
                                              onClick={() =>
                                                handleReplyVote(
                                                  c.id,
                                                  r.id,
                                                  rt.type,
                                                )
                                              }
                                              data-label={rt.label}
                                            >
                                              {rt.icon}
                                            </span>
                                          ))}
                                        </div>
                                        <button
                                          className={`fb-reply-action-btn like-btn ${
                                            r.user_reaction
                                              ? `reacted type-${r.user_reaction}`
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleReplyVote(
                                              c.id,
                                              r.id,
                                              r.user_reaction
                                                ? r.user_reaction
                                                : "like",
                                            )
                                          }
                                        >
                                          {r.user_reaction ? (
                                            <span
                                              className="reaction-label"
                                              style={{
                                                color: reactionTypes.find(
                                                  (rt) =>
                                                    rt.type === r.user_reaction,
                                                )?.color,
                                              }}
                                            >
                                              {
                                                reactionTypes.find(
                                                  (rt) =>
                                                    rt.type === r.user_reaction,
                                                )?.label
                                              }
                                            </span>
                                          ) : (
                                            <span className="reaction-label">
                                              Like
                                            </span>
                                          )}
                                        </button>
                                      </div>

                                      {/* 3. Reply Button */}
                                      <button
                                        className="fb-reply-action-btn"
                                        onClick={() => {
                                          // Set active reply to THIS specific reply
                                          setActiveReplyId(r.id);
                                          // Pre-fill mention
                                          const first = getFirstName(r.user_name);
                                          if (first) setReplyText(`@${first} `);
                                        }}
                                      >
                                        Reply
                                      </button>

                                      {/* 4. More Options (...) */}
                                      {(user?.id == r.user_id ||
                                        user?.role === "officer") && (
                                        <div className="fb-more-actions mini">
                                          <button
                                            className={`fb-reply-action-btn fb-more-btn ${
                                              activeMenuId === `r-${r.id}`
                                                ? "active"
                                                : ""
                                            }`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveMenuId(
                                                activeMenuId === `r-${r.id}`
                                                  ? null
                                                  : `r-${r.id}`,
                                              );
                                            }}
                                          >
                                            <i className="fa-solid fa-ellipsis"></i>
                                          </button>
                                          {activeMenuId === `r-${r.id}` && (
                                            <div className="fb-actions-dropdown">
                                              {user?.id == r.user_id && (
                                                <button
                                                  onClick={() => {
                                                    setEditingReplyId(r.id);
                                                    setEditingReplyText(
                                                      r.reply_text,
                                                    );
                                                    setActiveMenuId(null);
                                                  }}
                                                >
                                                  <i className="fa-solid fa-pen"></i>{" "}
                                                  Edit
                                                </button>
                                              )}
                                              <button
                                                className="delete-action"
                                                onClick={() => {
                                                  handleDeleteReply(c.id, r.id);
                                                  setActiveMenuId(null);
                                                }}
                                              >
                                                <i className="fa-solid fa-trash"></i>{" "}
                                                Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* 1. Time */}
                                      <span className="fb-reply-time">
                                        {formatDate(r.created_at)}
                                      </span>

                                      {/* 5. Reaction Summary (Count & Icons) */}
                                      {r.likes > 0 && (
                                        <div className="fb-comment-reaction-summary reply-summary">
                                          <span className="summary-count">
                                            {r.likes}
                                          </span>
                                          {Object.entries(
                                            r.reaction_breakdown || {},
                                          ).length > 0 ? (
                                            <div className="reaction-badges">
                                              {Object.keys(r.reaction_breakdown)
                                                .slice(0, 3)
                                                .map((type) => (
                                                  <span
                                                    key={type}
                                                    className={`summary-icon badge-${type}`}
                                                  >
                                                    {
                                                      reactionTypes.find(
                                                        (rt) =>
                                                          rt.type === type,
                                                      )?.icon
                                                    }
                                                  </span>
                                                ))}
                                            </div>
                                          ) : (
                                            <div className="reaction-badges">
                                              <span className="summary-icon badge-like">
                                                👍
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Nested Reply Input */}
                                {activeReplyId === r.id && (
                                  <div className="fb-reply-card input-card">
                                    <img
                                      src={getPhotoUrl(
                                        user?.photo || user?.photoUrl,
                                      )}
                                      alt="Me"
                                      className="fb-avatar-xs"
                                    />
                                    <div className="fb-reply-box-modern">
                                      <textarea
                                        autoFocus
                                        placeholder={`Reply to ${getFirstName(r.user_name) || ''}...`}
                                        value={replyText}
                                        onChange={(e) =>
                                          setReplyText(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey
                                          ) {
                                            e.preventDefault();
                                            handleReplySubmit(c.id);
                                          }
                                        }}
                                      />
                                      <button
                                        className="fb-reply-submit-btn"
                                        onClick={() => handleReplySubmit(c.id)}
                                        disabled={
                                          !replyText.trim() || replyLoading
                                        }
                                      >
                                        <i className="fa-solid fa-paper-plane"></i>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reply Input at the bottom of the thread (Main Comment) */}
                    {activeReplyId === c.id && (
                      <div className="fb-reply-composer-bottom">
                        <img
                          src={getPhotoUrl(user?.photo || user?.photoUrl)}
                          alt="Me"
                          className="fb-avatar-xs"
                        />
                        <div className="fb-reply-box-modern">
                          <textarea
                            autoFocus
                            placeholder={`Reply to ${getFirstName(c.user_name) || ''}...`}
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
                            className="fb-reply-submit-btn"
                            onClick={() => handleReplySubmit(c.id)}
                            disabled={!replyText.trim() || replyLoading}
                          >
                            <i className="fa-solid fa-paper-plane"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
