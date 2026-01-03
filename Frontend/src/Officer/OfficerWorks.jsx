import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "../Home/Pages/Works.css";
import "./OfficerWorks.css";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

const WorkCard = ({ work, onEdit, onDelete }) => {
  return (
    <div className="work-card" style={{ position: "relative" }}>
      {/* Action Buttons and Status on Top Right */}
      <div className="work-actions">
        <span className={`status-badge status-${work.status.toLowerCase()}`}>
          {work.status}
        </span>
        <button className="btn-edit-work" onClick={() => onEdit(work)}>
          <span>✏️</span> Edit
        </button>
        <button className="btn-delete-work" onClick={() => onDelete(work.id)}>
          <span>🗑️</span> Delete
        </button>
      </div>

      <div className="work-header">
        <div>
          <div className="work-label">WORKS</div>
          <h3 className="work-title">{work.title}</h3>
          <p className="work-location">
            {work.ward}, {work.municipality}
          </p>
        </div>
      </div>

      <div className="work-image-container">
        <img
          src={
            work.image
              ? `${API_BASE_URL}/${work.image}`
              : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"
          }
          alt={work.title}
          className="work-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80";
          }}
        />
      </div>

      <div className="work-stats-grid">
        <div className="stat-item">
          <label>Start Date</label>
          <div>{work.start_date || work.startDate || "N/A"}</div>
        </div>
        <div className="stat-item">
          <label>End Date</label>
          <div>{work.end_date || work.endDate || "N/A"}</div>
        </div>
        <div className="stat-item">
          <label>Budget</label>
          <div>
            {work.budget.startsWith("Rs.") ? work.budget : `Rs. ${work.budget}`}
          </div>
        </div>
        <div className="stat-item">
          <label>Beneficiaries</label>
          <div>{work.beneficiaries}</div>
        </div>
      </div>

      <div className="work-description">
        <p>{work.description}</p>
      </div>
    </div>
  );
};

export default function OfficerWorks() {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.assigned_ward) {
      fetchWorks();
    }
  }, [user]);

  const fetchWorks = () => {
    setIsLoading(true);
    const url = `${API_ENDPOINTS.works.getAll}?ward_id=${user.assigned_ward}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        const worksData = Array.isArray(data) ? data : [];
        setWorks(worksData);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching works:", err);
        setIsLoading(false);
      });
  };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    fiscalYear: "",
    budget: "",
    startDate: "",
    endDate: "",
    contractorName: "",
    beneficiaries: "",
    image: "",
    imageFile: null,
  });

  const handleOpenForm = (work = null) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        title: work.title,
        description: work.description,
        status: work.status,
        fiscalYear: work.fiscalYear,
        budget: work.budget,
        startDate: work.startDate,
        endDate: work.endDate,
        contractorName: work.contractorName,
        beneficiaries: work.beneficiaries,
        image: work.image,
      });
    } else {
      setEditingWork(null);
      setFormData({
        title: "",
        description: "",
        status: "pending",
        fiscalYear: "",
        budget: "",
        startDate: "",
        endDate: "",
        contractorName: "",
        beneficiaries: "",
        image: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingWork(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: imageUrl, imageFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("status", formData.status);
    formDataToSend.append("budget", formData.budget);
    formDataToSend.append("start_date", formData.startDate);
    formDataToSend.append("end_date", formData.endDate);
    formDataToSend.append("beneficiaries", formData.beneficiaries);
    formDataToSend.append("officer_id", user?.id || "");

    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile);
    }

    try {
      const response = await fetch(API_ENDPOINTS.works.add, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("Work saved successfully!");
        fetchWorks();
        handleCloseForm();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Error submitting work:", err);
      alert("Failed to connect to server.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this work?")) {
      setWorks(works.filter((w) => w.id !== id));
    }
  };

  return (
    <OfficerLayout title="Development Works">
      <div className="officer-works-header">
        <p style={{ color: "#718096", margin: 0 }}>
          Manage development works and projects for your ward
        </p>
        <button className="btn-create-work" onClick={() => handleOpenForm()}>
          + Create New Work
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="work-form-overlay">
          <div className="work-form-modal">
            <div className="form-modal-header">
              <h2>{editingWork ? "Edit Work" : "Create New Work"}</h2>
              <button className="btn-close-modal" onClick={handleCloseForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="work-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Road Repair Work"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Status <span className="required">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe the work project..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Fiscal Year <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="fiscalYear"
                    value={formData.fiscalYear}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 2023/24"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Allocated Budget (Rs.) <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 20,00,000"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    placeholder="YYYY/MM/DD"
                  />
                </div>

                <div className="form-group">
                  <label>
                    End Date <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    placeholder="YYYY/MM/DD"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contractor Name</label>
                  <input
                    type="text"
                    name="contractorName"
                    value={formData.contractorName}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC Construction Pvt. Ltd."
                  />
                </div>

                <div className="form-group">
                  <label>
                    Beneficiaries <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="beneficiaries"
                    value={formData.beneficiaries}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 5,000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Work Image</label>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="file-input"
                    id="work-image-upload"
                  />
                  <label
                    htmlFor="work-image-upload"
                    className="file-upload-label"
                  >
                    <span className="upload-icon">📷</span>
                    <span>
                      {formData.imageFile
                        ? formData.imageFile.name
                        : "Choose Image"}
                    </span>
                  </label>
                  {formData.image && (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                    </div>
                  )}
                </div>
                <small style={{ color: "#718096", fontSize: "0.85rem" }}>
                  Upload an image or leave blank for default
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingWork ? "Update Work" : "Create Work"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Works List */}
      <div className="works-list">
        {isLoading ? (
          <div className="loading-state">Loading works...</div>
        ) : works.length === 0 ? (
          <div className="empty-state">
            <p>No works created yet. Click "Create New Work" to get started.</p>
          </div>
        ) : (
          works.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </OfficerLayout>
  );
}
