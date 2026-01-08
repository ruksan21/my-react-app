import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import { useWard } from "../Context/WardContext";
import "./Notices.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

const NoticeCard = ({ notice }) => {
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const expired = isExpired(notice.expiry_date);

  const renderAttachment = (attachment) => {
    if (!attachment) return null;
    
    let url = attachment;
    if (attachment && attachment.startsWith("uploads")) {
      const cleaned = attachment.replace(/^\/?uploads\/?/, "");
      url = `${API_ENDPOINTS.uploads}/${cleaned}`;
    }
    
    const lower = (attachment || "").toLowerCase();
    const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) =>
      lower.endsWith(ext)
    );
    
    return (
      <div className="notice-attachment">
        {isImage ? (
          <img src={url} alt="Notice attachment" className="notice-attachment-img" />
        ) : (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="attachment-link"
          >
            📎 View attachment
          </a>
        )}
      </div>
    );
  };

  const renderDocument = (document) => {
    if (!document) return null;
    
    let url = document;
    if (document && document.startsWith("uploads")) {
      const cleaned = document.replace(/^\/?uploads\/?/, "");
      url = `${API_ENDPOINTS.uploads}/${cleaned}`;
    }
    
    return (
      <div className="notice-document">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="document-link"
        >
          📄 View document
        </a>
      </div>
    );
  };

  return (
    <div className={`notice-card ${expired ? 'expired' : 'active'}`}>
      <div className="notice-header">
        <div>
          <div className={`notice-label ${expired ? 'expired-label' : 'active-label'}`}>
            {expired ? '🔴 EXPIRED NOTICE' : '🟢 ACTIVE NOTICE'}
          </div>
          <h3 className="notice-title">{notice.title}</h3>
          <p className="notice-date">
            📅 Published: {notice.published_date || new Date(notice.created_at).toLocaleDateString()}
            {notice.expiry_date && (
              <span className={`expiry-date ${expired ? 'expired-text' : ''}`}>
                {' '}• {expired ? 'Expired on' : 'Expires on'}: {notice.expiry_date}
              </span>
            )}
          </p>
        </div>
        <span className="notice-badge">
          📢
        </span>
      </div>

      {notice.attachment && renderAttachment(notice.attachment)}
      {notice.document && renderDocument(notice.document)}

      <div className="notice-content">
        <p>{notice.content}</p>
      </div>
    </div>
  );
};

export default function Notices({ embedded = false, wardId }) {
  const { municipality, ward } = useWard();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = API_ENDPOINTS.alerts.manageNotices;

    // Construct query parameters
    const params = new URLSearchParams();

    if (wardId) {
      // If specific ward ID provided (e.g. Profile page), use strict ID filter
      params.append("ward_id", wardId);
    } else {
      // For public pages, we'll need to resolve ward from context
      // This might need backend support for ward_number + municipality filter
      if (wardId) {
        params.append("ward_id", wardId);
      }
    }

    const queryString = params.toString();
    if (queryString) {
      url += "?" + queryString;
    }

    if (wardId) {
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            // Filter notices - show active ones and recently expired ones (within 7 days)
            const now = new Date();
            const filteredNotices = data.data.filter(notice => {
              if (!notice.expiry_date) return true; // No expiry, always show
              
              const expiryDate = new Date(notice.expiry_date);
              const daysSinceExpiry = (now - expiryDate) / (1000 * 60 * 60 * 24);
              
              // Show if not expired OR expired within last 7 days
              return daysSinceExpiry <= 7;
            });
            setNotices(Array.isArray(filteredNotices) ? filteredNotices : []);
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
      // If no wardId, we can't fetch notices yet
      setNotices([]);
      setIsLoading(false);
    }
  }, [ward, municipality, wardId]);

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`notices-page ${embedded ? "embedded" : ""}`}>
        {embedded && (
          <div className="embedded-header" style={{ marginBottom: 12 }}>
            <span className="embedded-pin">📍</span>
            <span className="embedded-title">
              {municipality} - Ward {ward}
            </span>
          </div>
        )}

        {!embedded && (
          <div className="section-header">
            <span className="section-pin">📢</span>
            <span className="section-title">Ward Notices</span>
          </div>
        )}

        <div className="notices-list">
          {isLoading ? (
            <div className="loading-state">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              No notices published for this ward yet.
            </div>
          ) : (
            notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
          )}
        </div>
        <div className="notices-note">
          These notices are officially published by Ward Officers.
        </div>
      </div>
    </>
  );
}
