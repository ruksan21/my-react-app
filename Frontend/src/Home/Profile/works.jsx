import React, { useState, useEffect } from "react";
import "./works.css";
import CommentSection from "../Component/CommentSection";
import { useWard } from "../Context/WardContext";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/useLanguage";
import { toNepaliNumber } from "../../data/nepal_locations";
import { toast } from "react-toastify";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

const WorkCard = ({ work }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isNP = language === "NP";
  const [likes, setLikes] = useState(parseInt(work.likes_count) || 0);
  const [isLiked, setIsLiked] = useState(work.user_liked > 0);
  const [userReaction, setUserReaction] = useState(work.user_reaction);
  const [reactionBreakdown, setReactionBreakdown] = useState(
    work.reaction_breakdown || {},
  );
  const [showComments, setShowComments] = useState(false);

  // Sync props to state (crucial for when list refreshes or component is reused)
  useEffect(() => {
    setLikes(parseInt(work.likes_count) || 0);
    setIsLiked(work.user_liked > 0);
    setUserReaction(work.user_reaction);
    setReactionBreakdown(work.reaction_breakdown || {});
  }, [work]);
  const handleLike = async (reactionType = "like") => {
    if (!user) return toast.info("Please login to like.");
    try {
      const res = await fetch(API_ENDPOINTS.works.toggleLike, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_id: work.id,
          user_id: user.id,
          reaction_type: reactionType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLikes(data.likes);
        setIsLiked(data.liked);
        // Update local reaction state
        setUserReaction(data.user_reaction);
        if (data.reaction_breakdown) {
          setReactionBreakdown(data.reaction_breakdown);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reactionTypes = [
    {
      type: "like",
      icon: "👍",
      label: isNP ? "मनपर्‍यो" : "Like",
      color: "#dab748ff",
    },
    {
      type: "love",
      icon: "❤️",
      label: isNP ? "माया" : "Love",
      color: "#f33e58",
    },
    {
      type: "care",
      icon: "🥰",
      label: isNP ? "हेरचाह" : "Care",
      color: "#f7b125",
    },
    {
      type: "haha",
      icon: "😆",
      label: isNP ? "हाहा" : "Haha",
      color: "#f7b125",
    },
    { type: "wow", icon: "😮", label: isNP ? "वाह" : "Wow", color: "#f7b125" },
    { type: "sad", icon: "😢", label: isNP ? "दुखी" : "Sad", color: "#f7b125" },
    {
      type: "angry",
      icon: "😡",
      label: isNP ? "रिसाएको" : "Angry",
      color: "#e9710f",
    },
  ];

  return (
    <div className="works-card" key={work.id} style={{ marginBottom: "30px" }}>
      <div className="works-card-header">
        <div>
          <p className="works-label">{t("profile.tabs.works")}</p>
          <h3>{work.title}</h3>
          <p className="works-subtitle">
            {work.location ||
              work.subtitle ||
              (isNP ? "वडा नं. १, काठमाडौं" : "Ward No. 1, Kathmandu")}
          </p>
        </div>
        <span
          className={`status-pill status-${(work.status || "pending")
            .toLowerCase()
            .replace("-", "")}`}
        >
          {isNP
            ? work.status === "Completed"
              ? "सम्पन्न"
              : work.status === "Ongoing"
                ? "सञ्चालनमा"
                : "पेन्डिङ"
            : work.status || "Pending"}
        </span>
      </div>

      <img
        src={
          work.image
            ? `${API_BASE_URL}/${work.image}`
            : "https://sewellbeard.com/wp-content/uploads/2021/02/us-72-west-road-project.jpeg"
        }
        alt={work.title}
        className="works-image"
        onError={(e) => {
          e.target.src =
            "https://sewellbeard.com/wp-content/uploads/2021/02/us-72-west-road-project.jpeg";
        }}
      />

      <div className="works-details">
        <div>
          <strong>{isNP ? "नुसुरु मिति" : "Start Date"}</strong>
          <p>
            {isNP
              ? toNepaliNumber(work.start_date || work.startDate || "N/A")
              : work.start_date || work.startDate || "N/A"}
          </p>
        </div>
        <div>
          <strong>{isNP ? "अन्तिम मिति" : "End Date"}</strong>
          <p>
            {isNP
              ? toNepaliNumber(work.end_date || work.endDate || "N/A")
              : work.end_date || work.endDate || "N/A"}
          </p>
        </div>
        <div>
          <strong>{isNP ? "बजेट" : "Budget"}</strong>
          <p>
            {work.budget
              ? isNP
                ? `रु. ${toNepaliNumber(work.budget)}`
                : `Rs. ${work.budget}`
              : isNP
                ? "उपलब्ध छैन"
                : "N/A"}
          </p>
        </div>
        <div>
          <strong>{isNP ? "लाभार्थीहरू" : "Beneficiaries"}</strong>
          <p>
            {isNP
              ? toNepaliNumber(work.beneficiaries || "N/A")
              : work.beneficiaries || "N/A"}
          </p>
        </div>
      </div>

      <p className="works-description">{work.description}</p>

      {/* Facebook Style Feedback Bar */}
      <div className="fb-feedback-summary">
        {likes > 0 && (
          <div className="fb-reaction-icons">
            {Object.keys(reactionBreakdown).length > 0 ? (
              Object.entries(reactionBreakdown)
                .filter(([, count]) => count > 0)
                .slice(0, 3)
                .map(([rt]) => {
                  const r = reactionTypes.find((item) => item.type === rt);
                  return r ? (
                    <span
                      key={rt}
                      className={`reaction-icon type-${rt}`}
                      style={{ fontSize: "20px" }}
                    >
                      {r.icon}
                    </span>
                  ) : null;
                })
            ) : (
              <span className="reaction-icon like" style={{ fontSize: "20px" }}>
                <i className="fa-solid fa-thumbs-up"></i>
              </span>
            )}
            <span className="reaction-count">
              {isNP ? toNepaliNumber(likes) : likes}
            </span>

            {/* Reaction Breakdown Tooltip */}
            <div className="reaction-tooltip">
              {Object.keys(reactionBreakdown).length > 0 ? (
                Object.entries(reactionBreakdown).map(([type, count]) => {
                  const reaction = reactionTypes.find((r) => r.type === type);
                  return count > 0 && reaction ? (
                    <div key={type} className="reaction-breakdown-item">
                      <span className="reaction-icon">{reaction.icon}</span>
                      <span className="reaction-label">{reaction.label}</span>
                      <span className="reaction-count">
                        {isNP ? toNepaliNumber(count) : count}
                      </span>
                    </div>
                  ) : null;
                })
              ) : (
                <div className="reaction-breakdown-item">
                  <span className="reaction-icon">👍</span>
                  <span className="reaction-label">Like</span>
                  <span className="reaction-count">
                    {isNP ? toNepaliNumber(likes) : likes}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="fb-stats-summary">
          <span className="stat-text">
            {isNP
              ? toNepaliNumber(work.comments_count || 0)
              : work.comments_count || 0}{" "}
            {isNP ? "प्रतिक्रियाहरू" : "comments"}
          </span>
        </div>
      </div>

      {/* Functional Interaction Bar */}
      <div className="fb-interaction-bar">
        <div
          className="fb-interaction-wrapper"
          style={{ position: "relative" }}
        >
          <div
            className="fb-reaction-dock top-dock"
            style={{ bottom: "100%", marginBottom: "5px" }}
          >
            {reactionTypes.map((r) => (
              <span
                key={r.type}
                className="reaction-emoji"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(r.type);
                }}
                title={r.label}
              >
                {r.icon}
              </span>
            ))}
          </div>
          <button
            className={`fb-btn like-btn ${
              isLiked ? `reacted type-${userReaction || "like"}` : ""
            }`}
            onClick={() =>
              handleLike(
                isLiked && userReaction === "like"
                  ? "like"
                  : userReaction || "like",
              )
            }
          >
            {userReaction &&
            reactionTypes.find((r) => r.type === userReaction) ? (
              <>
                <span className="current-reaction-icon">
                  {reactionTypes.find((r) => r.type === userReaction).icon}
                </span>
                <span
                  className="reaction-label"
                  style={{
                    color: reactionTypes.find((r) => r.type === userReaction)
                      .color,
                    fontWeight: "700",
                  }}
                >
                  {reactionTypes.find((r) => r.type === userReaction).label}
                </span>
              </>
            ) : (
              <>
                <i className="fa-regular fa-thumbs-up"></i>
                <span className="reaction-label">Like</span>
              </>
            )}
          </button>
        </div>

        <button
          className={`fb-btn ${showComments ? "active" : ""}`}
          onClick={() => setShowComments(!showComments)}
        >
          <i className="fa-regular fa-comment"></i>
          <span>{isNP ? "प्रतिक्रिया" : "Comment"}</span>
        </button>

        <button
          className="fb-btn"
          onClick={() => {
            const shareUrl = `${window.location.origin}/works?id=${work.id}`;
            navigator.clipboard.writeText(shareUrl);
            toast.success(
              isNP
                ? "कार्य लिंक क्लिपबोर्डमा प्रतिलिपि गरियो!"
                : "Work link copied to clipboard!",
            );
          }}
        >
          <i className="fa-solid fa-share-nodes"></i>
          <span>{isNP ? "साझा गर्नुहोस्" : "Share"}</span>
        </button>
      </div>

      {/* Integrated Comment Section */}
      {showComments && (
        <div className="fb-comments-section-container">
          <CommentSection
            workId={work.id}
            initialExpanded={true}
            hideToggle={true}
          />
        </div>
      )}
    </div>
  );
};

const Works = ({ wardId: propWardId }) => {
  const { language } = useLanguage();
  const isNP = language === "NP";
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wardId: contextWardId } = useWard();

  // Use prop wardId if provided, otherwise use context wardId
  const wardId = propWardId || contextWardId;

  useEffect(() => {
    if (!wardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // We can't use useAuth hook inside useEffect or callback directly if not top-level.
    // Let's grab user from localStorage for simplicity to pass current_user_id.
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userParam = currentUser ? `&current_user_id=${currentUser.id}` : "";

    fetch(`${API_ENDPOINTS.works.getAll}?ward_id=${wardId}${userParam}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Works API Response:", data); // Debug log
        console.log("Ward ID used:", wardId); // Debug log

        // Handle both response formats: direct array or {success: true, data: []}
        if (data.success && Array.isArray(data.data)) {
          setWorks(data.data);
        } else if (Array.isArray(data)) {
          setWorks(data);
        } else {
          setWorks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching works:", err);
        setWorks([]);
        setLoading(false);
      });
  }, [wardId]);

  if (loading) {
    return (
      <div className="loading-state">
        {isNP ? "कार्यहरू लोड हुँदैछ..." : "Loading works..."}
      </div>
    );
  }

  if (works.length === 0) {
    return (
      <div className="no-works">
        {isNP
          ? "यस वडाको लागि कुनै कार्यहरू फेला परेन।"
          : "No works found for this ward."}
      </div>
    );
  }

  return (
    <section className="works-section">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </section>
  );
};

export default Works;
