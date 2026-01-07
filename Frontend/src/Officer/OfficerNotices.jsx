import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerNotices.css";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

const OfficerNotices = () => {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [customExpiry, setCustomExpiry] = useState(""); // datetime-local always visible
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notices from backend
  useEffect(() => {
    if (user?.assigned_ward || workLocation) {
      fetchNotices();
    }
  }, [user, workLocation]);

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      let url = `${API_ENDPOINTS.alerts.manageNotices}`;
      
      // Use work location if available, otherwise fall back to assigned_ward
      if (workLocation) {
        const params = new URLSearchParams({
          work_province: workLocation.work_province || "",
          work_district: workLocation.work_district || "",
          work_municipality: workLocation.work_municipality || "",
          work_ward: String(workLocation.work_ward || ""),
        });
        url += `?${params.toString()}`;
      } else if (user?.assigned_ward) {
        url += `?ward_id=${user.assigned_ward}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setNotices(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setAttachment(file);
    if (file && file.type && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setAttachmentPreview(url);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setDocumentFile(file);
    setDocumentName(file ? file.name : "");
  };

  const computeExpiryDate = () => {
    if (!customExpiry) return null;
    // customExpiry is in 'YYYY-MM-DDTHH:MM'
    let d = new Date(customExpiry);
    if (isNaN(d.getTime())) return null;
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // DEBUG: Log what's available
    console.log("=== DEBUG: OfficerNotices handleSubmit ===");
    console.log("user object:", user);
    console.log("workLocation from getOfficerWorkLocation():", workLocation);
    console.log("user.work_province:", user?.work_province);
    console.log("user.work_district:", user?.work_district);
    console.log("user.work_municipality:", user?.work_municipality);
    console.log("user.work_ward:", user?.work_ward);
    console.log("user.assigned_ward:", user?.assigned_ward);

    // Build payload as FormData to support optional file upload and expiry
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("content", formData.content);
    fd.append("officer_id", String(user.id));
    const expiryDate = computeExpiryDate();
    if (expiryDate) fd.append("expiry_date", expiryDate);
    if (workLocation) {
      fd.append("work_province", workLocation.work_province || "");
      fd.append("work_district", workLocation.work_district || "");
      fd.append("work_municipality", workLocation.work_municipality || "");
      // Use work_ward from workLocation, OR fall back to user.work_ward
      const wardNumber = workLocation.work_ward != null ? workLocation.work_ward : user?.work_ward;
      if (wardNumber != null) fd.append("work_ward", String(wardNumber));
      console.log("Using workLocation from context (with fallback for work_ward)");
    } else if (user?.work_province || user?.work_district) {
      // Fallback: use user fields directly
      fd.append("work_province", user.work_province || "");
      fd.append("work_district", user.work_district || "");
      fd.append("work_municipality", user.work_municipality || "");
      if (user.work_ward != null) fd.append("work_ward", String(user.work_ward));
      console.log("Using work_* from user object directly");
    } else if (user?.assigned_ward) {
      fd.append("ward_id", String(user.assigned_ward));
      console.log("Falling back to assigned_ward:", user.assigned_ward);
    } else {
      console.warn("WARNING: No work location or ward found! Form may fail on backend.");
    }
    if (attachment) fd.append("attachment", attachment);
    if (documentFile) fd.append("document", documentFile);

    console.log("Submitting notice (FormData) with fields:", {
      title: formData.title,
      content: formData.content,
      officer_id: user.id,
      work_province: workLocation?.work_province || user?.work_province,
      work_district: workLocation?.work_district || user?.work_district,
      work_municipality: workLocation?.work_municipality || user?.work_municipality,
      work_ward: workLocation?.work_ward || user?.work_ward,
      ward_id: user?.assigned_ward,
      expiry_date: expiryDate,
      attachment: attachment ? attachment.name : null,
      document: documentFile ? documentFile.name : null,
    });

    try {
      const response = await fetch(API_ENDPOINTS.alerts.manageNotices, {
        method: "POST",
        body: fd,
      });

      const result = await response.json();
      console.log("Notice API response:", result);
      
      if (result.success) {
        setFormData({ title: "", content: "" });
        setAttachment(null);
        if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
        setAttachmentPreview(null);
        setCustomExpiry("");
        setDocumentFile(null);
        setDocumentName("");
        setShowForm(false);
        fetchNotices(); // Reload notices
      } else {
        alert("Error: " + (result.message || "Failed to create notice"));
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        const response = await fetch(
          API_ENDPOINTS.alerts.manageNotices,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          }
        );

        const result = await response.json();
        if (result.success) {
          fetchNotices(); // Reload notices
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("Failed to delete notice");
      }
    }
  };

  return (
    <OfficerLayout title="Notices">
      <div className="recent-activity">
        <div className="notices-header">
          <h2 className="section-title">Ward Notices</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="create-notice-btn"
          >
            <span>{showForm ? "✕" : "+"}</span>{" "}
            {showForm ? "Cancel" : "Create Notice"}
          </button>
        </div>

        {showForm && (
          <div className="notice-form-container glass-card">
            <h3 className="notice-form-title">New Notice</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Enter notice title"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="form-input"
                  placeholder="Enter notice content"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Image (optional)</label>
                  <div className="upload-area" onClick={() => document.getElementById('notice-image-input').click()}>
                    <span>Click to upload image</span>
                  </div>
                  <input
                    id="notice-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-input file-input hidden-input"
                  />
                  {attachmentPreview && (
                    <div className="attachment-preview">
                      <img src={attachmentPreview} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">File (optional)</label>
                  <div className="upload-area" onClick={() => document.getElementById('notice-doc-input').click()}>
                    <span>{documentName || 'Click to upload file (PDF, DOC, etc.)'}</span>
                  </div>
                  <input
                    id="notice-doc-input"
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleDocumentChange}
                    className="form-input file-input hidden-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expiry (optional)</label>
                <div className="expiry-row">
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                  />
                  <div className="expiry-chips">
                    <button type="button" className="chip" onClick={() => {
                      const d = new Date(); d.setHours(d.getHours() + 24);
                      setCustomExpiry(d.toISOString().slice(0,16));
                    }}>+24h</button>
                    <button type="button" className="chip" onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + 7);
                      setCustomExpiry(d.toISOString().slice(0,16));
                    }}>+7d</button>
                    <button type="button" className="chip" onClick={() => {
                      const d = new Date(); d.setMonth(d.getMonth() + 1);
                      setCustomExpiry(d.toISOString().slice(0,16));
                    }}>+1m</button>
                    <button type="button" className="chip clear" onClick={() => setCustomExpiry("")}>No expiry</button>
                  </div>
                </div>
              </div>
              <button type="submit" className="publish-btn">
                Publish Notice
              </button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="no-notices">Loading notices...</div>
        ) : (
          <div className="notices-list">
            {notices.map((notice) => (
              <div key={notice.id} className="notice-card glass-card">
                <div className="notice-header">
                  <div>
                    <h3 className="notice-title">{notice.title}</h3>
                    <p className="notice-date">
                      📅 Published on {notice.published_date}
                      {notice.expiry_date && (
                        <span className="expiry-label"> • Expires on {notice.expiry_date}</span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="notice-delete-btn"
                  >
                    Delete
                  </button>
                </div>
                {notice.attachment && (
                  <NoticeAttachment attachment={notice.attachment} />
                )}
                {notice.document && (
                  <NoticeDocument document={notice.document} />
                )}
                <p className="notice-content">{notice.content}</p>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notices.length === 0 && (
          <div className="no-notices">
            No notices published yet. Click "Create Notice" to add one.
          </div>
        )}
      </div>
    </OfficerLayout>
  );
};

export default OfficerNotices;

// Helper component for rendering attachment
const NoticeAttachment = ({ attachment }) => {
  // Build absolute URL from stored relative path
  let url = attachment;
  if (attachment && attachment.startsWith("uploads")) {
    // Ensure no leading slash duplication
    const cleaned = attachment.replace(/^\/?uploads\/?/, "");
    url = `${API_ENDPOINTS.uploads}/${cleaned}`;
  }
  const lower = (attachment || "").toLowerCase();
  const isImage = [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => lower.endsWith(ext));
  return (
    <div className="notice-attachment">
      {isImage ? (
        <img src={url} alt="Notice attachment" />
      ) : (
        <a href={url} target="_blank" rel="noreferrer" className="attachment-link">
          View attachment
        </a>
      )}
    </div>
  );
};

const NoticeDocument = ({ document }) => {
  let url = document;
  if (document && document.startsWith("uploads")) {
    const cleaned = document.replace(/^\/?uploads\/?/, "");
    url = `${API_ENDPOINTS.uploads}/${cleaned}`;
  }
  return (
    <div className="notice-document">
      <a href={url} target="_blank" rel="noreferrer" className="attachment-link">
        View file
      </a>
    </div>
  );
};
