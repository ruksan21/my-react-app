import { useState, useEffect } from "react";
import "./NoticePopup.css";
import { API_ENDPOINTS } from "../../config/api";
import { useWard } from "../Context/WardContext";

const API_BASE_URL = "http://localhost/my-react-app/Backend/api";

const NoticePopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [notices, setNotices] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { wardId } = useWard();

  useEffect(() => {
    if (!wardId) {
      console.log("NoticePopup: No wardId available");
      return;
    }

    const fetchAndShowNotices = () => {
      console.log("NoticePopup: Fetching notices for ward_id:", wardId);
      const url = `${API_ENDPOINTS.alerts.manageNotices}?ward_id=${wardId}`;
      console.log("NoticePopup: API URL:", url);

      // Fetch all notices
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          console.log("NoticePopup: API Response:", data);
          if (data.success && data.data && data.data.length > 0) {
            console.log("NoticePopup: Found notices:", data.data.length);
            // Filter notices not yet shown
            const shownNotices = JSON.parse(localStorage.getItem('shownNotices') || '[]');
            console.log("NoticePopup: Previously shown notices:", shownNotices);
            const unshownNotices = data.data.filter(notice => !shownNotices.includes(notice.id));
            console.log("NoticePopup: Unshown notices:", unshownNotices.length);
            
            if (unshownNotices.length > 0) {
              setNotices(unshownNotices);
              setShowPopup(true);
              console.log("NoticePopup: Showing popup with", unshownNotices.length, "notices");
            } else {
              console.log("NoticePopup: All notices already shown");
            }
          } else {
            console.log("NoticePopup: No notices found or API failed");
          }
        })
        .catch((err) => console.error("NoticePopup: Error fetching notices:", err));
    };

    // Initial fetch
    fetchAndShowNotices();

    // Check for new notices every 30 seconds
    const interval = setInterval(fetchAndShowNotices, 30000);

    return () => clearInterval(interval);
  }, [wardId]);

  const handleClose = () => {
    if (notices.length > 0) {
      // Mark current notice as shown
      const shownNotices = JSON.parse(localStorage.getItem('shownNotices') || '[]');
      shownNotices.push(notices[currentIndex].id);
      localStorage.setItem('shownNotices', JSON.stringify(shownNotices));
      console.log("NoticePopup: Marked notice as shown:", notices[currentIndex].id);
    }
    setShowPopup(false);
  };

  const handleNext = () => {
    if (currentIndex < notices.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleViewAll = () => {
    // Mark all as shown
    const shownNotices = JSON.parse(localStorage.getItem('shownNotices') || '[]');
    notices.forEach(notice => {
      if (!shownNotices.includes(notice.id)) {
        shownNotices.push(notice.id);
      }
    });
    localStorage.setItem('shownNotices', JSON.stringify(shownNotices));
    console.log("NoticePopup: Marked all notices as shown");
    setShowPopup(false);
    window.location.href = '/notices';
  };

  // Add function to reset shown notices (for testing)
  useEffect(() => {
    window.resetNoticePopup = () => {
      localStorage.removeItem('shownNotices');
      console.log("NoticePopup: Cleared shown notices from localStorage");
      window.location.reload();
    };
  }, []);

  if (!showPopup || notices.length === 0) return null;

  const currentNotice = notices[currentIndex];
  const hasImage = currentNotice.image_file;
  const hasDocument = currentNotice.document_file;

  return (
    <>
      <div className="notice-popup-overlay" onClick={handleClose}></div>
      <div className="notice-popup-container compact">
        <button className="notice-popup-close" onClick={handleClose}>
          ✕
        </button>
        
        {/* Progress Indicator */}
        {notices.length > 1 && (
          <div className="notice-progress">
            {currentIndex + 1} / {notices.length}
          </div>
        )}
        
        <div className="notice-card">
          {/* Title */}
          <h3 className="notice-card-title">{currentNotice.title}</h3>
          
          {/* Image Preview */}
          {hasImage && (
            <div className="notice-card-image">
              <img 
                src={`${API_BASE_URL}/uploads/notices/${currentNotice.image_file}`} 
                alt="Notice"
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.parentElement.style.display = 'none';
                }}
                onLoad={() => console.log("Image loaded successfully:", currentNotice.image_file)}
              />
            </div>
          )}
          
          {/* Description */}
          {currentNotice.description && (
            <p className="notice-card-description">{currentNotice.description}</p>
          )}
          
          {/* Document Link */}
          {hasDocument && (
            <a 
              href={`${API_BASE_URL}/uploads/notices/${currentNotice.document_file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="notice-card-document"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="doc-icon">📄</span>
              <span>View Document</span>
            </a>
          )}
          
          {/* Expiry Date */}
          {currentNotice.expiry_date && (
            <div className="notice-card-footer">
              <span className="expires-label">Expires:</span>
              <span className="expires-date">
                {new Date(currentNotice.expiry_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
        
        {/* Navigation Arrows */}
        {notices.length > 1 && (
          <div className="notice-navigation">
            <button 
              className="notice-nav-btn prev" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ‹
            </button>
            <button 
              className="notice-nav-btn next" 
              onClick={handleNext}
              disabled={currentIndex === notices.length - 1}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NoticePopup;
