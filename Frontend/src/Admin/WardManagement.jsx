// WardManagement Component
import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import ChairpersonPersonalAssets from "./ChairpersonPersonalAssets";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import "./WardManagement.css";

const WardManagement = () => {
  const { refreshWards } = useAuth();

  // State for District Management
  const [isAddingDistrict, setIsAddingDistrict] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");

  // Form State for Ward
  const [formData, setFormData] = useState({
    ward_number: "",
    district_id: "",
    municipality: "",
    location: "",
    google_map_link: "",
    contact_phone: "",
    telephone: "",
    contact_email: "",
    chairperson_name: "",
    chairperson_phone: "",
    chairperson_email: "",
    chairperson_education: "",
    chairperson_experience: "",
    chairperson_political_party: "",
    chairperson_appointment_date: "",
    chairperson_bio: "",
  });

  const [selectedWard, setSelectedWard] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    fetchDistricts();
    fetchWards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrict]);

  const fetchDistricts = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.districts.getAll);
      const data = await res.json();
      if (data.success) setDistricts(data.data);
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    }
  };

  const fetchWards = async () => {
    setIsLoading(true);
    try {
      const url =
        selectedDistrict === "all"
          ? API_ENDPOINTS.wards.getAll
          : `${API_ENDPOINTS.wards.getAll}?district_id=${selectedDistrict}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setWards(data.data);
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
  };

  const handleFormDistrictChange = (e) => {
    setFormData({ ...formData, district_id: e.target.value });
  };

  const handleAddDistrict = async (e) => {
    e.preventDefault();
    if (!newDistrictName.trim()) return;

    try {
      const res = await fetch(API_ENDPOINTS.districts.add, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDistrictName }),
      });
      const data = await res.json();
      if (data.success) {
        alert("District added successfully!");
        setNewDistrictName("");
        setIsAddingDistrict(false);
        fetchDistricts(); // Refresh list
      } else {
        alert("Failed to add district: " + data.message);
      }
    } catch {
      alert("Error adding district.");
    }
  };

  const handleAddWardClick = () => {
    setFormData({
      ward_number: "",
      district_id: districts.length > 0 ? districts[0].id : "",
      municipality: "",
      location: "",
      google_map_link: "",
      contact_phone: "",
      telephone: "",
      contact_email: "",
      chairperson_name: "",
      chairperson_phone: "",
      chairperson_email: "",
      chairperson_education: "",
      chairperson_experience: "",
      chairperson_political_party: "",
      chairperson_appointment_date: "",
      chairperson_bio: "",
    });
    setIsAdding(true);
  };

  // Helper for numeric input
  const handleNumericInput = (e, field) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]+$/.test(val)) {
      setFormData({ ...formData, [field]: val });
    }
  };

  const handleEditClick = (ward) => {
    setSelectedWard(ward);
    setFormData({
      ward_number: ward.ward_number || "",
      district_id: ward.district_id || "",
      municipality: ward.municipality || "",
      location: ward.location || "",
      google_map_link: ward.google_map_link || "",
      contact_phone: ward.contact_phone || "",
      telephone: ward.telephone || "",
      contact_email: ward.contact_email || "",
      chairperson_name: ward.chairperson_name || "",
      chairperson_phone: ward.chairperson_phone || "",
      chairperson_email: ward.chairperson_email || "",
      chairperson_education: ward.chairperson_education || "",
      chairperson_experience: ward.chairperson_experience || "",
      chairperson_political_party: ward.chairperson_political_party || "",
      chairperson_appointment_date: ward.chairperson_appointment_date || "",
      chairperson_bio: ward.chairperson_bio || "",
    });
    setIsEditing(true);
    setIsAdding(false);
    setIsViewingProfile(false);
    setActiveTab("details");
  };

  const handleViewProfile = (ward) => {
    setSelectedWard(ward);
    setIsViewingProfile(true);
    setIsEditing(false);
    setIsAdding(false);
  };

  const resetFormAndClose = () => {
    setIsEditing(false);
    setIsAdding(false);
    setIsViewingProfile(false);
    setSelectedWard(null);
    setProfilePhotoFile(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const saveUrl = isAdding
      ? API_ENDPOINTS.wards.add
      : API_ENDPOINTS.wards.update;

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    if (!isAdding && selectedWard) {
      submitData.append("id", selectedWard.id);
    }

    if (profilePhotoFile) {
      submitData.append("chairperson_photo", profilePhotoFile);
    }

    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        body: submitData,
      });
      const data = await res.json();
      if (data.success) {
        alert(
          isAdding ? "Ward added successfully!" : "Ward updated successfully!"
        );
        resetFormAndClose();
        fetchWards();
        refreshWards();
      } else {
        alert("Failed to save: " + data.message);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("An error occurred while saving.");
    }
  };

  const handleDeleteWard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ward?")) return;
    try {
      const res = await fetch(API_ENDPOINTS.wards.delete, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWards();
        refreshWards();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // RENDER Start
  return (
    <AdminLayout title="Ward Management">
      {/* Add District Modal */}
      {isAddingDistrict && (
        <div className="ward-modal-overlay">
          <div className="district-modal-content">
            <h3>Add New District</h3>
            <form onSubmit={handleAddDistrict}>
              <input
                type="text"
                placeholder="District Name"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                className="district-input"
                required
              />
              <div className="district-modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddingDistrict(false)}
                  className="btn-cancel-small"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-add-small">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isEditing && !isAdding && !isViewingProfile ? (
        <div className="table-container">
          <div className="table-header-actions">
            <h2 className="section-title">All Wards</h2>
            <div className="ward-filter-container">
              <label className="filter-label">Filter by District:</label>
              <div className="filter-controls">
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="district-select"
                >
                  <option value="all">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsAddingDistrict(true)}
                  className="btn-icon-add"
                  title="Add New District"
                >
                  +
                </button>
              </div>

              <span className="total-count">Total: {wards.length}</span>
              <button
                className="action-btn approve"
                onClick={handleAddWardClick}
              >
                + Add Ward
              </button>
            </div>
          </div>

          {isLoading ? (
            <p>Loading wards...</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ward No.</th>
                  <th>Municipality/District</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Telephone</th>
                  <th>Chairperson</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward) => (
                  <tr key={ward.id}>
                    <td className="ward-number-cell">
                      Ward {ward.ward_number}
                    </td>
                    <td>
                      {ward.municipality ? (
                        <span className="district-subtext">
                          {ward.municipality}
                        </span>
                      ) : null}
                      <span className="district-muted">
                        {ward.district_name}
                      </span>
                    </td>
                    <td>
                      {ward.location || "N/A"}
                      {ward.google_map_link && (
                        <a
                          href={ward.google_map_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="map-link"
                        >
                          View Map
                        </a>
                      )}
                    </td>
                    <td>{ward.contact_phone || "N/A"}</td>
                    <td>{ward.telephone || "N/A"}</td>
                    <td>
                      <div className="chairperson-cell">
                        <div className="profile-avatar-circle avatar-small">
                          {ward.chairperson_name
                            ? ward.chairperson_name.charAt(0)
                            : "?"}
                        </div>
                        {ward.chairperson_name || "Not Assigned"}
                      </div>
                    </td>
                    <td>
                      {/* Actions buttons */}
                      <div className="action-buttons">
                        <button
                          className="action-btn approve btn-view-profile"
                          onClick={() => handleViewProfile(ward)}
                        >
                          View Profile
                        </button>
                        <button
                          className="action-btn approve btn-edit-ward"
                          onClick={() => handleEditClick(ward)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete btn-delete-ward"
                          onClick={() => handleDeleteWard(ward.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : isViewingProfile ? (
        <div className="stat-card ward-profile-container">
          <div>
            <h3 className="profile-section-title">Ward Contact Details</h3>
            <div className="profile-grid-2">
              <div>
                <label className="stat-label">Location</label>
                <p className="profile-value">
                  {selectedWard?.location || "N/A"}
                </p>
                {selectedWard?.google_map_link && (
                  <a
                    href={selectedWard.google_map_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    View on Google Maps
                  </a>
                )}
              </div>
              <div>
                <label className="stat-label">Mobile (Contact)</label>
                <p className="profile-value">
                  {selectedWard?.contact_phone || "N/A"}
                </p>
              </div>
              <div>
                <label className="stat-label">Telephone</label>
                <p className="profile-value">
                  {selectedWard?.telephone || "N/A"}
                </p>
              </div>
              <div>
                <label className="stat-label">Ward Email</label>
                <p className="profile-value">
                  {selectedWard?.contact_email || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <button onClick={resetFormAndClose} className="btn-close-large">
            Close
          </button>
        </div>
      ) : (
        /* Edit/Add View */
        <div className="stat-card ward-form-container">
          <div className="ward-form-header">
            <h2 className="section-title">
              {isAdding
                ? "Add New Ward"
                : `Edit Ward ${selectedWard?.ward_number} - ${selectedWard?.district_name}`}
            </h2>
            <button onClick={resetFormAndClose} className="btn-close-icon">
              ✕
            </button>
          </div>

          {!isAdding && (
            <div className="ward-tabs">
              <button
                onClick={() => setActiveTab("details")}
                className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              >
                Ward Details
              </button>
              <button
                onClick={() => setActiveTab("personal_assets")}
                className={`tab-btn ${
                  activeTab === "personal_assets" ? "active" : ""
                }`}
              >
                Personal Assets
              </button>
            </div>
          )}

          {(activeTab === "details" || isAdding) && (
            <form onSubmit={handleSave} className="ward-form-grid">
              <h3 className="ward-info-title">Ward Information</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label className="stat-label">District *</label>
                  <div className="input-with-button">
                    <select
                      required
                      value={formData.district_id}
                      onChange={handleFormDistrictChange}
                      disabled={!isAdding}
                      className="form-select-flex"
                    >
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsAddingDistrict(true)}
                      className="btn-plus-inline"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <label className="stat-label">Municipality / Palika *</label>
                  <input
                    type="text"
                    required
                    placeholder="Type Municipality Name..."
                    value={formData.municipality}
                    onChange={(e) =>
                      setFormData({ ...formData, municipality: e.target.value })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Ward Number *</label>
                  <input
                    type="number"
                    required
                    value={formData.ward_number}
                    onChange={(e) =>
                      setFormData({ ...formData, ward_number: e.target.value })
                    }
                    disabled={!isAdding}
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Google Map Link</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.google_map_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        google_map_link: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div className="grid-3-col">
                  <div>
                    <label className="stat-label">Mobile (Contact Phone)</label>
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      value={formData.contact_phone}
                      onChange={(e) => handleNumericInput(e, "contact_phone")}
                      className="form-input-full"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Telephone</label>
                    <input
                      type="tel"
                      pattern="[0-9]*"
                      value={formData.telephone}
                      onChange={(e) => handleNumericInput(e, "telephone")}
                      className="form-input-full"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Email</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_email: e.target.value,
                        })
                      }
                      className="form-input-full"
                    />
                  </div>
                </div>
              </div>

              {/* Chairperson Profile Inputs */}
              <h3 className="ward-info-title">Current Chairperson Profile</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label className="stat-label">Chairperson Name</label>
                  <input
                    type="text"
                    value={formData.chairperson_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_name: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProfilePhotoFile(e.target.files[0]);
                      }
                    }}
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Personal Phone</label>
                  <input
                    type="text"
                    value={formData.chairperson_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_phone: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Personal Email</label>
                  <input
                    type="email"
                    value={formData.chairperson_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_email: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Political Party</label>
                  <input
                    type="text"
                    value={formData.chairperson_political_party}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_political_party: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Appointed Date</label>
                  <input
                    type="date"
                    value={formData.chairperson_appointment_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_appointment_date: e.target.value,
                      })
                    }
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Education</label>
                  <input
                    type="text"
                    value={formData.chairperson_education}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_education: e.target.value,
                      })
                    }
                    placeholder="e.g., Masters in Public Administration"
                    className="form-input-full"
                  />
                </div>
                <div>
                  <label className="stat-label">Experience</label>
                  <input
                    type="text"
                    value={formData.chairperson_experience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_experience: e.target.value,
                      })
                    }
                    placeholder="e.g., 5 years as Ward Member"
                    className="form-input-full"
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label className="stat-label">Bio / Message</label>
                  <textarea
                    rows="3"
                    value={formData.chairperson_bio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_bio: e.target.value,
                      })
                    }
                    className="form-input-full"
                    style={{ fontFamily: "inherit" }}
                  />
                </div>
              </div>

              <div className="form-actions-footer">
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="action-btn btn-cancel-small"
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn approve btn-save">
                  {isAdding ? "Create Ward" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "personal_assets" && (
            <div style={{ marginTop: "20px" }}>
              <ChairpersonPersonalAssets wardId={selectedWard.id} />
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default WardManagement;
