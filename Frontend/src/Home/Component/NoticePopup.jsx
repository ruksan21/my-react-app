import { useState, useEffect } from "react";
import "./NoticePopup.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useWard } from "../Context/WardContext";

const NoticePopup = ({ notice: propNotice, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { wardId } = useWard();

  // Handle automatic mode vs specific notice mode
  useEffect(() => {
    if (propNotice) {
      setNotices([propNotice]);
      setShowPopup(true);
      return;
    }

    if (!wardId) return;

    const fetchAndShowNotices = () => {
      const url = `${API_ENDPOINTS.alerts.manageNotices}?ward_id=${wardId}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && data.data.length > 0) {
            const shownNotices = JSON.parse(
              localStorage.getItem("shownNotices") || "[]"
            );
            const unshownNotices = data.data.filter(
              (n) => !shownNotices.includes(n.id)
            );

            if (unshownNotices.length > 0) {
              setNotices(unshownNotices);
              setShowPopup(true);
            }
          }
        })
        .catch((err) =>
          console.error("NoticePopup: Error fetching notices:", err)
        );
    };

    fetchAndShowNotices();
    const interval = setInterval(fetchAndShowNotices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [wardId, propNotice]);

  const handleClose = () => {
    if (!propNotice && notices.length > 0) {
      // Mark current notice as shown in localStorage only in automatic mode
      const shownNotices = JSON.parse(
        localStorage.getItem("shownNotices") || "[]"
      );
      shownNotices.push(notices[currentIndex].id);
      localStorage.setItem("shownNotices", JSON.stringify(shownNotices));
    }

    setShowPopup(false);
    if (onClose) onClose();
  };

  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    // Files are stored in Backend/api/uploads/notices/
    const uploadsBase = `${API_BASE_URL}/uploads`;

    // If the path already starts with 'uploads/', strip it and build correct URL
    if (path.startsWith("uploads/")) {
      const cleanPath = path.replace("uploads/", "");
      return `${uploadsBase}/${cleanPath}`;
    }

    // If path starts with 'notices/', add uploads base
    if (path.startsWith("notices/")) {
      return `${uploadsBase}/${path}`;
    }

    // Default: assume it's just a filename in notices folder
    return `${uploadsBase}/notices/${path}`;
  };

  const getNoticeAssets = (notice) => {
    const images = [];
    const documents = [];
    const allPaths = new Set();

    // 1. Gather all potential paths
    if (notice.images) {
      try {
        const parsed = JSON.parse(notice.images);
        if (Array.isArray(parsed)) parsed.forEach((p) => allPaths.add(p));
      } catch (e) {
        console.error("Error parsing images JSON:", e);
      }
    }
    if (notice.attachment) allPaths.add(notice.attachment);
    if (notice.document) allPaths.add(notice.document);

    // 2. Categorize based on extension
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

    allPaths.forEach((path) => {
      if (!path) return;
      const lower = path.toLowerCase();
      const isImage = imageExtensions.some((ext) => lower.endsWith(ext));

      if (isImage) {
        images.push(path);
      } else {
        documents.push(path);
      }
    });

    return { images, documents };
  };

  const openFullscreen = (imageUrl, index) => {
    setFullscreenImage(imageUrl);
    setCurrentImageIndex(index);
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
  };

  const nextImage = (images) => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (images) => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDocumentClick = (e, url) => {
    e.preventDefault();
    e.stopPropagation();

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop(); // Use filename from URL
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!showPopup || notices.length === 0) return null;

  const currentNotice = notices[currentIndex];
  // console.log("Notice Data:", currentNotice); // Temporary debug
  const { images, documents } = getNoticeAssets(currentNotice);
  // console.log("Extracted Assets:", { images, documents }); // Temporary debug

  return (
    <>
      <div className="notice-popup-overlay" onClick={handleClose}></div>
      <div className="notice-popup-container">
        <div className="notice-popup-header-bar">
          <div className="notice-popup-badge">Public Notice</div>
          <button
            className="notice-popup-close"
            onClick={handleClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="notice-popup-body">
          <h2 className="notice-card-title">{currentNotice.title}</h2>

          <div className="notice-meta">
            <div className="meta-item">
              <span>📅</span>
              <span>
                {new Date(
                  currentNotice.created_at || Date.now()
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {currentNotice.expiry_date && (
              <div className="meta-item">
                <span style={{ color: "#ef4444" }}>⏳</span>
                <span style={{ color: "#ef4444" }}>
                  Expires:{" "}
                  {new Date(currentNotice.expiry_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="notice-images-gallery">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="notice-card-image"
                  onClick={() => openFullscreen(getFileUrl(img), idx)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={getFileUrl(img)}
                    alt={`Notice visual ${idx + 1}`}
                    onError={(e) => {
                      console.error(
                        "NoticePopup: Image failed to load:",
                        e.target.src
                      );
                      e.target.parentElement.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {currentNotice.content && (
            <div className="notice-card-description">
              {currentNotice.content}
            </div>
          )}

          {documents.map((docPath, dIdx) => (
            <a
              key={dIdx}
              href={getFileUrl(docPath)}
              onClick={(e) => handleDocumentClick(e, getFileUrl(docPath))}
              className="notice-card-document"
              style={{
                marginBottom: dIdx < documents.length - 1 ? "12px" : "0",
              }}
            >
              <div className="doc-icon-wrapper">📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>
                  Attached Document {documents.length > 1 ? dIdx + 1 : ""}
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Click to download
                </div>
              </div>
              <div style={{ fontSize: "18px", color: "#6366f1" }}>↓</div>
            </a>
          ))}
        </div>

        {notices.length > 1 && (
          <div style={{ padding: "0 24px 20px 24px" }}>
            <div className="notice-footer-info">
              <div className="notice-pagination">
                {notices.map((_, idx) => (
                  <div
                    key={idx}
                    className={`nav-dot ${
                      idx === currentIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="notice-popup-close"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentIndex === 0}
                  style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
                >
                  ←
                </button>
                <button
                  className="notice-popup-close"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(notices.length - 1, prev + 1)
                    )
                  }
                  disabled={currentIndex === notices.length - 1}
                  style={{
                    opacity: currentIndex === notices.length - 1 ? 0.3 : 1,
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={closeFullscreen}>
          <button className="fullscreen-close" onClick={closeFullscreen}>
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                className="fullscreen-nav fullscreen-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage(images);
                }}
              >
                ←
              </button>
              <button
                className="fullscreen-nav fullscreen-next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage(images);
                }}
              >
                →
              </button>
            </>
          )}
          <img
            src={getFileUrl(images[currentImageIndex])}
            alt="Fullscreen view"
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <div className="fullscreen-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default NoticePopup;
