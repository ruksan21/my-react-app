import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerNotices.css";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

const OfficerNotices = () => {
  const { officerWorkLocation, user } = useAuth();
  const workLocation = officerWorkLocation;
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // Track ID for editing
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [attachments, setAttachments] = useState([]); // Changed to array for multiple images
  const [attachmentPreviews, setAttachmentPreviews] = useState([]); // Array of preview URLs
  const [customExpiry, setCustomExpiry] = useState(""); // datetime-local always visible
  const [documentFile, setDocumentFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [wardError, setWardError] = useState(null);

  // Ref for scrolling to form
  const formRef = React.useRef(null);

  // Fetch notices from backend
  useEffect(() => {
    if (user?.assigned_ward || workLocation) {
      fetchNotices();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, workLocation]);
  const fetchNotices = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (workLocation) {
        params.append("work_province", workLocation.work_province || "");
        params.append("work_district", workLocation.work_district || "");
        params.append(
          "work_municipality",
          workLocation.work_municipality || ""
        );
        params.append("work_ward", String(workLocation.work_ward || ""));
      } else if (user?.assigned_ward) {
        params.append("ward_id", String(user.assigned_ward));
      }

      const response = await fetch(
        `${API_ENDPOINTS.alerts.manageNotices}?${params.toString()}`
      );
      const result = await response.json();

      if (result.success) {
        setNotices(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [workLocation, user?.assigned_ward, setNotices, setIsLoading]);

  useEffect(() => {
    if (user?.assigned_ward || workLocation) {
      fetchNotices();
    } else {
      setIsLoading(false);
    }
  }, [user?.id, workLocation, fetchNotices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setAttachments([]);
      setAttachmentPreviews([]);
      return;
    }

    const fileArray = Array.from(files);
    setAttachments(fileArray);

    // Create previews for image files
    const previews = [];
    fileArray.forEach((file) => {
      if (file.type && file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        previews.push(url);
      }
    });
    setAttachmentPreviews(previews);
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

  const [existingImages, setExistingImages] = useState([]); // Array of existing image paths
  const [existingDocument, setExistingDocument] = useState(null); // Path of existing document
  const [deleteDocument, setDeleteDocument] = useState(false); // Flag to delete doc
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Current slide index

  // Image slider navigation
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : existingImages.length - 1
    );
  };
  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < existingImages.length - 1 ? prev + 1 : 0
    );
  };

  const handleEdit = (notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      content: notice.content,
    });

    let formattedExpiry = "";
    if (notice.expiry_date) {
      const date = new Date(notice.expiry_date);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        formattedExpiry = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }
    setCustomExpiry(formattedExpiry);

    // Initializing existing assets robustly
    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const allPaths = new Set();
    if (notice.images) {
      try {
        const parsed = JSON.parse(notice.images);
        if (Array.isArray(parsed)) parsed.forEach((p) => allPaths.add(p));
      } catch {
        /* ignore */
      }
    }
    if (notice.attachment) allPaths.add(notice.attachment);
    if (notice.document) allPaths.add(notice.document);

    const fImages = [];
    const fDocs = [];
    allPaths.forEach((p) => {
      if (!p) return;
      const isImg = imageExtensions.some((ext) =>
        p.toLowerCase().endsWith(ext)
      );
      if (isImg) fImages.push(p);
      else fDocs.push(p);
    });

    setExistingImages(fImages);
    setExistingDocument(fDocs[0] || null); // Edit form currently handles one primary document
    setDeleteDocument(false);

    // Clear new files
    setAttachments([]);
    setAttachmentPreviews([]);
    setDocumentFile(null);
    setDocumentName("");

    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: "", content: "" });
    setCustomExpiry("");
    setExistingImages([]);
    setExistingDocument(null);
    setDeleteDocument(false);
    setAttachments([]);
    attachmentPreviews.forEach((url) => URL.revokeObjectURL(url));
    setAttachmentPreviews([]);
    setDocumentFile(null);
    setDocumentName("");
    setShowForm(false);
    setWardError(null);
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages((prev) => {
      const newImages = prev.filter((_, idx) => idx !== indexToRemove);
      // Reset index if out of bounds
      if (currentImageIndex >= newImages.length && newImages.length > 0) {
        setCurrentImageIndex(newImages.length - 1);
      } else if (newImages.length === 0) {
        setCurrentImageIndex(0);
      }
      return newImages;
    });
  };

  const handleRemoveExistingDocument = () => {
    setExistingDocument(null);
    setDeleteDocument(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert("Title and content are required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("content", formData.content);
    const expiryDate = computeExpiryDate();
    if (expiryDate) fd.append("expiry_date", expiryDate);

    if (editingId) {
      fd.append("id", editingId);
      // Send state of existing assets
      fd.append("existing_images", JSON.stringify(existingImages));
      if (deleteDocument) {
        fd.append("delete_document", "true");
      }
    }

    if (user && user.id) {
      fd.append("officer_id", String(user.id));
    }

    // ... (location params logic unchanged) ...
    // Append location params
    if (workLocation) {
      if (workLocation.work_province)
        fd.append("work_province", workLocation.work_province);
      if (workLocation.work_district)
        fd.append("work_district", workLocation.work_district);
      if (workLocation.work_municipality)
        fd.append("work_municipality", workLocation.work_municipality);
      if (workLocation.work_ward != null)
        fd.append("work_ward", String(workLocation.work_ward));
    } else if (user?.assigned_ward) {
      fd.append("ward_id", String(user.assigned_ward));
    } else if (user?.work_province || user?.work_district) {
      fd.append("work_province", user.work_province || "");
      fd.append("work_district", user.work_district || "");
      fd.append("work_municipality", user.work_municipality || "");
      if (user.work_ward != null)
        fd.append("work_ward", String(user.work_ward));
    }

    if (!user?.assigned_ward && !workLocation && !user?.work_province) {
      console.warn("WARNING: No work location/ward found!");
    }

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        fd.append("images[]", file);
      });
    }
    if (documentFile) fd.append("document", documentFile);

    try {
      const response = await fetch(API_ENDPOINTS.alerts.manageNotices, {
        method: "POST",
        body: fd,
      });

      const result = await response.json();
      // ... (rest logic same) ...
      if (response.status === 422) {
        setWardError(result.message || "Ward not found.");
        return;
      }

      if (result.success) {
        setWardError(null);
        handleCancelEdit();
        fetchNotices();
        alert(
          editingId
            ? "Notice updated successfully!"
            : "Notice published successfully!"
        );
      } else {
        console.error("Failed to save notice:", result);
        if (result.message && result.message.includes("Ward not found")) {
          setWardError(result.message);
        } else {
          alert("Failed: " + (result.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error creating notice:", error);
      alert("Failed to create notice: " + error.message);
    }
  };

  // URL Helper
  const getFileUrl = (path) => {
    if (!path) return "";
    let clean = path;
    if (path.startsWith("uploads/")) clean = path.replace("uploads/", "");
    else if (path.startsWith("uploads")) clean = path.replace("uploads", "");

    return clean.startsWith("http")
      ? clean
      : `${API_ENDPOINTS.uploads}/${clean}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        const response = await fetch(API_ENDPOINTS.alerts.manageNotices, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

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
      <div className="officer-notices-container">
        {wardError && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.05))",
              border: "2px solid rgba(220, 38, 38, 0.5)",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "20px",
              color: "#dc2626",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backdropFilter: "blur(10px)",
            }}
          >
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                Ward Not Found
              </div>
              <div style={{ fontSize: "0.9em", opacity: 0.9 }}>{wardError}</div>
            </div>
          </div>
        )}
        <div className="notices-header">
          <div>
            <h2 className="section-title">Ward Notices</h2>
            <p className="description-text">
              Publish updates and announcements for your ward
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="create-notice-btn"
            >
              <span>+</span> Create New Notice
            </button>
          )}
        </div>

        {showForm && (
          <div className="notice-form-container glass-card" ref={formRef}>
            <h3 className="notice-form-title">
              {editingId ? "Edit Notice" : "New Notice"}
            </h3>
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

              {/* Existing Assets Section (Only in Edit Mode) */}
              {editingId && (existingImages.length > 0 || existingDocument) && (
                <div
                  className="form-group"
                  style={{
                    background:
                      "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <label
                    className="form-label"
                    style={{
                      marginBottom: "12px",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#1e40af",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    📎 Current Attachments
                  </label>

                  {/* Existing Images Slider */}
                  {existingImages.length > 0 && (
                    <div
                      style={{
                        background: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: existingDocument ? "16px" : "0",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {/* Prev Button */}
                        {existingImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handlePrevImage}
                            style={{
                              background:
                                "linear-gradient(135deg, #3b82f6, #2563eb)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              cursor: "pointer",
                              fontSize: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(59, 130, 246, 0.4)",
                              transition: "transform 0.2s",
                            }}
                          >
                            ◀
                          </button>
                        )}

                        {/* Current Image */}
                        <div
                          style={{
                            position: "relative",
                            flex: 1,
                            textAlign: "center",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        >
                          <img
                            src={getFileUrl(existingImages[currentImageIndex])}
                            alt={`Image ${currentImageIndex + 1}`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: "180px",
                              borderRadius: "8px",
                              objectFit: "contain",
                              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExistingImage(currentImageIndex)
                            }
                            title="Remove this image"
                            style={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              background:
                                "linear-gradient(135deg, #ef4444, #dc2626)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "28px",
                              height: "28px",
                              cursor: "pointer",
                              fontSize: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                            }}
                          >
                            ✕
                          </button>
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "0.85em",
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            📷 {currentImageIndex + 1} of{" "}
                            {existingImages.length}
                          </div>
                        </div>

                        {/* Next Button */}
                        {existingImages.length > 1 && (
                          <button
                            type="button"
                            onClick={handleNextImage}
                            style={{
                              background:
                                "linear-gradient(135deg, #3b82f6, #2563eb)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "40px",
                              height: "40px",
                              cursor: "pointer",
                              fontSize: "18px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 2px 6px rgba(59, 130, 246, 0.4)",
                              transition: "transform 0.2s",
                            }}
                          >
                            ▶
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Existing Document */}
                  {existingDocument && (
                    <div
                      style={{
                        background: "white",
                        borderRadius: "10px",
                        padding: "14px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span style={{ fontSize: "1.5rem" }}>📄</span>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#334155",
                              fontSize: "0.95rem",
                            }}
                          >
                            Attached Document
                          </div>
                          <a
                            href={getFileUrl(existingDocument)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#3b82f6",
                              fontSize: "0.85rem",
                              textDecoration: "underline",
                            }}
                          >
                            Click to view / download
                          </a>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveExistingDocument}
                        style={{
                          background:
                            "linear-gradient(135deg, #ef4444, #dc2626)",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 14px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Add Images (Optional)</label>
                  <div
                    className="upload-area"
                    onClick={() =>
                      document.getElementById("notice-image-input").click()
                    }
                  >
                    <span>
                      {attachments.length > 0
                        ? `${attachments.length} new images selected`
                        : "Click to upload new images"}
                    </span>
                  </div>
                  <input
                    id="notice-image-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="form-input file-input hidden-input"
                  />
                  {attachmentPreviews.length > 0 && (
                    <div className="attachment-previews-grid">
                      {attachmentPreviews.map((preview, idx) => (
                        <div key={idx} className="attachment-preview">
                          <img src={preview} alt={`Preview ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Replace File (Optional)</label>
                  <div
                    className="upload-area"
                    onClick={() =>
                      document.getElementById("notice-doc-input").click()
                    }
                  >
                    <span>
                      {documentName ||
                        (existingDocument
                          ? "Upload to replace document"
                          : "Click to upload document")}
                    </span>
                  </div>
                  <input
                    id="notice-doc-input"
                    type="file"
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleDocumentChange}
                  />
                  {documentName && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>📄</span>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#166534",
                            fontSize: "0.9rem",
                          }}
                        >
                          Selected to Upload
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#15803d" }}>
                          {documentName}
                        </div>
                      </div>
                    </div>
                  )}
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
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="publish-btn"
                  style={{ flex: 1 }}
                >
                  {editingId ? "Update Notice" : "Publish Notice"}
                </button>
                <button
                  type="button"
                  className="publish-btn"
                  style={{ flex: 1, background: "#cbd5e1", color: "#334155" }}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="no-notices">Loading notices...</div>
        ) : (
          <div className="notices-list">
            {notices.map((notice) => (
              <NoticeItem
                key={notice.id}
                notice={notice}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
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

// Helper to construct file URLs
const getFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  // Files are stored in Backend/api/uploads/notices/
  const uploadsBase = API_ENDPOINTS.uploads;

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

const NoticeItem = ({ notice, onEdit, onDelete }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Categorize assets robustly
  const { images, documents } = React.useMemo(() => {
    const images = [];
    const documents = [];
    const allPaths = new Set();

    if (notice.images) {
      try {
        const parsed = JSON.parse(notice.images);
        if (Array.isArray(parsed)) parsed.forEach((p) => allPaths.add(p));
      } catch {
        /* ignore */
      }
    }
    if (notice.attachment) allPaths.add(notice.attachment);
    if (notice.document) allPaths.add(notice.document);

    const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    allPaths.forEach((path) => {
      if (!path) return;
      const lower = path.toLowerCase();
      const isImage = imageExtensions.some((ext) => lower.endsWith(ext));
      if (isImage) images.push(path);
      else documents.push(path);
    });

    return { images, documents };
  }, [notice]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      className="notice-card glass-card"
      style={{ marginBottom: "20px", display: "flex", flexDirection: "column" }}
    >
      <div className="notice-header">
        <div>
          <h3 className="notice-title">{notice.title}</h3>
          <p className="notice-date">
            📅 Published on {new Date(notice.created_at).toLocaleDateString()}
            {notice.expiry_date && (
              <span className="expiry-label">
                {" "}
                • Expires on {new Date(notice.expiry_date).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="notice-delete-btn"
            style={{ background: "#3b82f6" }}
            onClick={() => onEdit(notice)}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(notice.id)}
            className="notice-delete-btn"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Image Slider */}
      {images.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {images.length > 1 && (
              <button
                onClick={handlePrev}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                ◀
              </button>
            )}

            <div style={{ flex: 1, position: "relative", textAlign: "center" }}>
              <img
                src={getFileUrl(images[currentImgIndex])}
                alt={`Slide ${currentImgIndex}`}
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  borderRadius: "8px",
                  objectFit: "contain",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              {images.length > 1 && (
                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "0.85em",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  📷 {currentImgIndex + 1} of {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <button
                onClick={handleNext}
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                ▶
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document Links */}
      {documents.map((docPath, dIdx) => (
        <div
          key={dIdx}
          style={{
            marginBottom: "16px",
            background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
            padding: "12px 16px",
            borderRadius: "8px",
            borderLeft: "4px solid #3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.4em" }}>📄</span>
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#1e3a8a",
                  fontSize: "0.95em",
                }}
              >
                Attached Document {documents.length > 1 ? dIdx + 1 : ""}
              </div>
              <div style={{ fontSize: "0.85em", color: "#64748b" }}>
                Click button to view
              </div>
            </div>
          </div>
          <a
            href={getFileUrl(docPath)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "white",
              color: "#2563eb",
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "0.9em",
              fontWeight: 600,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #bfdbfe",
            }}
          >
            View / Download
          </a>
        </div>
      ))}

      <div
        className="notice-content"
        style={{ whiteSpace: "pre-wrap", color: "#334155", lineHeight: "1.6" }}
      >
        {notice.content}
      </div>
    </div>
  );
};
