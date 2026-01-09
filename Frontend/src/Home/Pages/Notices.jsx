import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import { useWard } from "../Context/WardContext";
import "./Notices.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import NoticePopup from "../Component/NoticePopup";

const NoticeCard = ({ notice, onClick }) => {
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const expired = isExpired(notice.expiry_date);

  return (
    <div
      className={`notice-card-v2 ${expired ? "expired" : "active"}`}
      onClick={() => onClick(notice)}
    >
      <div className="notice-card-header">
        <div className="notice-type-tag">Official Notice</div>
        <div className="notice-date-v2">
          {new Date(
            notice.published_date || notice.created_at
          ).toLocaleDateString()}
        </div>
      </div>

      <h3 className="notice-card-title-v2">{notice.title}</h3>

      <p className="notice-card-excerpt">
        {notice.content || notice.description}
      </p>

      <div className="notice-card-footer-v2">
        <button className="read-more-btn">
          View Details <span>→</span>
        </button>
        {expired && <span className="expired-badge-v2">Expired</span>}
      </div>
    </div>
  );
};

export default function Notices({ embedded = false, wardId: propWardId }) {
  const { municipality, ward } = useWard();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Use either the provided propWardId or the ward from context
  const targetWardId = propWardId || ward;

  useEffect(() => {
    setIsLoading(true);
    // Build URL with ward_id
    const url = `${API_ENDPOINTS.alerts.manageNotices}?ward_id=${
      targetWardId || ""
    }`;

    if (targetWardId) {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setNotices(data.data);
          } else {
            setNotices([]);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching notices:", err);
          setNotices([]);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [targetWardId]);

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`notices-page-v2 ${embedded ? "embedded" : ""}`}>
        {!embedded && (
          <div className="notices-hero">
            <h1>Ward Notices & Alerts</h1>
            <p>
              Official announcements and updates from {municipality}, Ward{" "}
              {ward}
            </p>
          </div>
        )}

        <div className="notices-grid">
          {isLoading ? (
            <div className="loading-state">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              No notices published for this ward yet.
            </div>
          ) : (
            notices.map((notice) => (
              <NoticeCard
                key={notice.id}
                notice={notice}
                onClick={(n) => setSelectedNotice(n)}
              />
            ))
          )}
        </div>

        {selectedNotice && (
          <NoticePopup
            notice={selectedNotice}
            onClose={() => setSelectedNotice(null)}
          />
        )}

        <div className="notices-footer-note">
          Verified official communication from Ward {ward} Office.
        </div>
      </div>
    </>
  );
}
