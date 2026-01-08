import React, { useState, useEffect } from "react";
import OfficerLayout from "./OfficerLayout";
import "./OfficerDepartments.css";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";

const DepartmentCard = ({ department, onEdit, onDelete }) => {
  return (
    <div className="department-card">
      {/* Action Buttons */}
      <div className="dept-actions">
        <button className="btn-edit-dept" onClick={() => onEdit(department)}>
          <span>✏️</span> Edit
        </button>
        <button
          className="btn-delete-dept"
          onClick={() => onDelete(department.id)}
        >
          <span>🗑️</span> Delete
        </button>
      </div>

      <div className="dept-icon">{department.icon}</div>
      <h3 className="dept-name">
        <button
          type="button"
          className="dept-name-btn"
          onClick={() => onEdit(department)}
          aria-label={`Edit ${department.name}`}
        >
          {department.name}
        </button>
      </h3>

      <div className="dept-info">
        <div className="dept-info-item">
          <span className="info-icon">👤</span>
          <span>{department.headName || department.head_name}</span>
        </div>
        <div className="dept-info-item">
          <span className="info-icon">📞</span>
          <span>{department.phone}</span>
        </div>
        <div className="dept-info-item">
          <span className="info-icon">✉️</span>
          <span>{department.email}</span>
        </div>
      </div>
    </div>
  );
};

export default function OfficerDepartments() {
  const { getOfficerWorkLocation, user } = useAuth();
  const workLocation = getOfficerWorkLocation();
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartments = React.useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `${API_ENDPOINTS.alerts.manageDepartments}`;
      if (workLocation) {
        const params = new URLSearchParams({
          work_province: workLocation.work_province || "",
          work_district: workLocation.work_district || "",
          work_municipality: workLocation.work_municipality || "",
          work_ward: String(workLocation.work_ward || ""),
        });
        url += `?${params.toString()}`;
      } else {
        url += `?ward_id=${user.assigned_ward}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setDepartments(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [workLocation, user?.assigned_ward, setDepartments, setIsLoading]);

  // Fetch departments from backend
  useEffect(() => {
    if (workLocation || user?.assigned_ward) {
      fetchDepartments();
    }
  }, [user, workLocation, fetchDepartments]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    headName: "",
    phone: "",
    email: "",
    icon: "🏢",
  });

  const handleOpenForm = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        headName: dept.headName,
        phone: dept.phone,
        email: dept.email,
        icon: dept.icon,
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: "",
        headName: "",
        phone: "",
        email: "",
        icon: "🏢",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDept(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const method = editingDept ? "PUT" : "POST";
      const body = editingDept
        ? { id: editingDept.id, officer_id: user.id, ...formData }
        : {
            ward_id: 0,
            officer_id: user.id,
            ...formData,
            work_province: workLocation?.work_province,
            work_district: workLocation?.work_district,
            work_municipality: workLocation?.work_municipality,
            work_ward: workLocation?.work_ward,
          };

      const response = await fetch(API_ENDPOINTS.alerts.manageDepartments, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.success) {
        handleCloseForm();
        fetchDepartments(); // Reload departments
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await fetch(API_ENDPOINTS.alerts.manageDepartments, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, officer_id: user.id }),
        });

        const result = await response.json();
        if (result.success) {
          fetchDepartments(); // Reload departments
        } else {
          alert("Error: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        alert("Failed to delete department");
      }
    }
  };

  const iconOptions = [
    "🏢",
    "🏗️",
    "👥",
    "💰",
    "📚",
    "🏥",
    "🚓",
    "🌳",
    "⚖️",
    "🔧",
  ];

  return (
    <OfficerLayout title="Department Contacts">
      <div className="officer-depts-header">
        <p style={{ color: "#718096", margin: 0 }}>
          Manage department contact information for your ward
        </p>
        <button className="btn-create-dept" onClick={() => handleOpenForm()}>
          + Add Department
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="dept-form-overlay">
          <div className="dept-form-modal">
            <div className="form-modal-header">
              <h2>{editingDept ? "Edit Department" : "Add Department"}</h2>
              <button className="btn-close-modal" onClick={handleCloseForm}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="dept-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Department Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Administration Department"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Department Head <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="headName"
                    value={formData.headName}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Mr. Ram Bahadur Shrestha"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 01-4234567"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., admin@wardportal.gov.np"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Icon <span className="required">*</span>
                </label>
                <div className="icon-selector">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`icon-option ${
                        formData.icon === icon ? "selected" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
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
                  {editingDept ? "Update Department" : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="departments-grid">
        {isLoading ? (
          <div className="empty-state">
            <p>Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="empty-state">
            <p>
              No departments added yet. Click "Add Department" to get started.
            </p>
          </div>
        ) : (
          departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onEdit={handleOpenForm}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </OfficerLayout>
  );
}
