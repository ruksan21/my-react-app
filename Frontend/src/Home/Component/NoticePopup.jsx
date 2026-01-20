import { useState, useEffect } from "react";
import "./NoticePopup.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
import { useWard } from "../Context/WardContext";
import { useLocation } from "react-router-dom";

const NoticePopup = ({ notice: propNotice, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { wardId } = useWard();
  const location = useLocation();

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Handle automatic mode vs specific notice mode
  useEffect(() => {
    if (propNotice) {
      setNotices([propNotice]);
      setShowPopup(true);
      return;
    }

    if (!wardId) return;

    // Only automatically show popups on the home page (root path)
    if (location.pathname !== "/") {
      setShowPopup((prev) => (prev ? false : prev));
      return;
    }

    const fetchAndShowNotices = () => {
      const url = `${API_ENDPOINTS.alerts.manageNotices}?ward_id=${wardId}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && data.data.length > 0) {
            const shownNotices = JSON.parse(
              localStorage.getItem("shownNotices") || "[]",
            );
            const unshownNotices = data.data.filter(
              (n) => !shownNotices.includes(n.id),
            );

            if (unshownNotices.length > 0) {
              setNotices(unshownNotices);
              setShowPopup(true);
            }
          }
        })
        .catch((err) =>
          console.error("NoticePopup: Error fetching notices:", err),
        );
    };

    fetchAndShowNotices();
    const interval = setInterval(fetchAndShowNotices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [wardId, propNotice, location.pathname]);

  const handleClose = () => {
    if (!propNotice && notices.length > 0) {
      // Mark current notice as shown in localStorage
      const shownNotices = JSON.parse(
        localStorage.getItem("shownNotices") || "[]",
      );
      const currentId = notices[currentIndex].id;
      if (!shownNotices.includes(currentId)) {
        shownNotices.push(currentId);
        localStorage.setItem("shownNotices", JSON.stringify(shownNotices));
      }

      // If there are more notices in the array that haven't been seen in this session,
      // and we are not at the end of the list, move to the next one.
      if (currentIndex < notices.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        return; // Stay open and show next notice
      }
    }

    setShowPopup(false);
    if (onClose) onClose();
  };

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < notices.length - 1) {
      // Swipe left - next notice
      setCurrentIndex((prev) => prev + 1);
    }

    if (isRightSwipe && currentIndex > 0) {
      // Swipe right - previous notice
      setCurrentIndex((prev) => prev - 1);
    }
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
  const { images, documents } = getNoticeAssets(currentNotice);

  return (
    <>
      <div
        className="notice-popup-overlay"
        onClick={handleClose}
        style={{ zIndex: 99999 }}
      ></div>
      <div className="notice-popup-container" style={{ zIndex: 100000 }}>
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

        <div
          className="notice-popup-body"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <h2 className="notice-card-title">{currentNotice.title}</h2>

          <div className="notice-meta">
            <div className="meta-item">
              <span>📅</span>
              <span>
                {new Date(
                  currentNotice.created_at || Date.now(),
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
                  {new Date(currentNotice.expiry_date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
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
                        e.target.src,
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
          <div className="notice-popup-footer">
            <div className="notice-counter-container">
              <div className="notice-counter">
                {currentIndex + 1} / {notices.length}
              </div>
              <div className="notice-dots">
                {notices.map((_, idx) => (
                  <div
                    key={idx}
                    className={`notice-dot ${
                      idx === currentIndex ? "active" : ""
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  ></div>
                ))}
              </div>
            </div>
            <div className="notice-navigation">
              <button
                className="footer-nav-btn prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentIndex === 0}
              >
                ← Prev
              </button>
              {currentIndex < notices.length - 1 ? (
                <button
                  className="footer-nav-btn next highlight"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => prev + 1);
                  }}
                >
                  Next →
                </button>
              ) : (
                <button className="footer-nav-btn close" onClick={handleClose}>
                  Got it
                </button>
              )}
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
