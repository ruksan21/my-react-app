// WardManagement Component
import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import ChairpersonPersonalAssets from "./ChairpersonPersonalAssets";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
} from "../data/nepal_locations";
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

  // Cascading Selection State for Form
  const [formProvince, setFormProvince] = useState("");
  const [formDistrictName, setFormDistrictName] = useState("");
  const [availableWardNumbers, setAvailableWardNumbers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDeleting, setIsDeleting] = useState(false);
  const [wardToDelete, setWardToDelete] = useState(null);

  useEffect(() => {
    fetchDistricts();
    fetchWards();
  }, []); // Only fetch once on mount now, filtering is frontend-based

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
      const url = API_ENDPOINTS.wards.getAll; // Fetch all wards for frontend filtering
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

  const handleNumericInput = (e, field) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]+$/.test(val)) {
      setFormData({ ...formData, [field]: val });
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
    setFormProvince("");
    setFormDistrictName("");
    setIsAdding(true);
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

    // Try to find province and district from metadata to pre-populate dropdowns
    const districtName = ward.district_name || "";
    setFormDistrictName(districtName);

    // Find province for this district
    const province = getProvinces().find((p) =>
      getDistricts(p).includes(districtName)
    );
    setFormProvince(province || "");

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
    setFormProvince("");
    setFormDistrictName("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Comprehensive Validation - All fields required
    const requiredFields = {
      ward_number: "Ward Number",
      district_id: "District",
      municipality: "Municipality",
      location: "Location",
      contact_phone: "Contact Phone",
      contact_email: "Contact Email",
      chairperson_name: "Chairperson Name",
      chairperson_phone: "Chairperson Phone",
      chairperson_email: "Chairperson Email",
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || !formData[field].toString().trim()) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields:\n\n• ${missingFields.join("\n• ")}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      alert("Please enter a valid contact email.");
      return;
    }
    if (!emailRegex.test(formData.chairperson_email)) {
      alert("Please enter a valid chairperson email.");
      return;
    }

    // Phone validation
    if (!/^[0-9\-\+\s]+$/.test(formData.contact_phone)) {
      alert("Please enter a valid contact phone number.");
      return;
    }
    if (!/^[0-9\-\+\s]+$/.test(formData.chairperson_phone)) {
      alert("Please enter a valid chairperson phone number.");
      return;
    }

    const saveUrl = isAdding
      ? API_ENDPOINTS.wards.add
      : API_ENDPOINTS.wards.update;

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    // Explicitly pass district_name for auto-registration
    if (formDistrictName) {
      submitData.append("district_name", formDistrictName);
    }

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

  const confirmDelete = (ward) => {
    setWardToDelete(ward);
    setIsDeleting(true);
  };

  const handleDeleteWard = async () => {
    if (!wardToDelete) return;
    try {
      const res = await fetch(API_ENDPOINTS.wards.delete, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: wardToDelete.id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleting(false);
        setWardToDelete(null);
        fetchWards();
        refreshWards();
      } else {
        alert("Failed to delete: " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Logic to handle available wards when municipality changes
  useEffect(() => {
    if (formProvince && formDistrictName && formData.municipality) {
      const munis = getMunicipalities(formProvince, formDistrictName);
      const selectedMuni = munis.find((m) => m.name === formData.municipality);
      if (selectedMuni) {
        const nums = Array.from(
          { length: selectedMuni.wards },
          (_, i) => i + 1
        );
        setAvailableWardNumbers(nums);
      } else {
        setAvailableWardNumbers([]);
      }
    } else {
      setAvailableWardNumbers([]);
    }
  }, [formProvince, formDistrictName, formData.municipality]);

  // Derived state for districts that actually have wards registered
  const registeredDistricts = React.useMemo(() => {
    const districtsWithWards = new Set();
    wards.forEach((w) => {
      if (w.district_id) districtsWithWards.add(parseInt(w.district_id));
    });

    return districts
      .filter((d) => districtsWithWards.has(parseInt(d.id)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wards, districts]);

  // Combined Filtering Logic
  const filteredWards = wards.filter((ward) => {
    // 1. District Filter
    if (
      selectedDistrict !== "all" &&
      parseInt(ward.district_id) !== parseInt(selectedDistrict)
    ) {
      return false;
    }

    // 2. Search Term Filter
    const searchLow = searchTerm.toLowerCase();
    const wardNoMatch = ward.ward_number.toString().includes(searchTerm);
    const muniMatch =
      ward.municipality && ward.municipality.toLowerCase().includes(searchLow);
    const districtMatch =
      ward.district_name &&
      ward.district_name.toLowerCase().includes(searchLow);
    const chairMatch =
      ward.chairperson_name &&
      ward.chairperson_name.toLowerCase().includes(searchLow);

    return wardNoMatch || muniMatch || districtMatch || chairMatch;
  });

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
                  {registeredDistricts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="search-box-container">
                  <input
                    type="text"
                    placeholder="Search Municipality, Chair or Ward..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="ward-search-input"
                  />
                  <i className="search-icon">🔍</i>
                </div>
              </div>

              <span className="total-count">Total: {filteredWards.length}</span>
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
                {filteredWards.map((ward) => (
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
                          onClick={() => confirmDelete(ward)}
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

          {/* Custom Delete Modal */}
          {isDeleting && (
            <div className="ward-modal-overlay delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-warning-icon">⚠️</div>
                <h3 className="delete-modal-title">Confirm Deletion</h3>
                <p className="delete-modal-text">
                  Are you sure you want to delete{" "}
                  <strong>Ward {wardToDelete?.ward_number}</strong> of{" "}
                  <strong>{wardToDelete?.municipality}</strong>?
                </p>
                <p className="delete-modal-subtext">
                  This action cannot be undone and all associated data will be
                  removed.
                </p>

                <div className="delete-modal-actions">
                  <button
                    className="btn-cancel-small"
                    onClick={() => {
                      setIsDeleting(false);
                      setWardToDelete(null);
                    }}
                  >
                    Keep Ward
                  </button>
                  <button
                    className="action-btn delete btn-confirm-delete"
                    onClick={handleDeleteWard}
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isViewingProfile ? (
        <div className="ward-modern-form-wrapper">
          <div className="ward-form-modern-card">
            <div className="ward-form-header-premium">
              <div className="header-title-group">
                <h2 className="modern-section-title">
                  Ward {selectedWard?.ward_number} - {selectedWard?.district_name}
                </h2>
                <p className="modern-section-subtitle">
                  {selectedWard?.municipality || "Municipality"}
                </p>
              </div>
              <button
                onClick={resetFormAndClose}
                className="btn-modern-close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="ward-tabs">
              <button
                onClick={() => setActiveTab("details")}
                className={`tab-btn ${
                  activeTab === "details" ? "active" : ""
                }`}
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

            {activeTab === "details" && (
              <div className="ward-view-content">
                {/* Section 1: Ward Contact Details */}
                <div className="form-content-section">
                  <h3 className="modern-info-title">
                    <i className="section-icon">📍</i> Office Location Details
                  </h3>
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
                      <label className="stat-label">Municipality</label>
                      <p className="profile-value">
                        {selectedWard?.municipality || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 2: Ward Office Contacts */}
                <div className="form-content-section section-contacts">
                  <h3 className="modern-info-title">
                    <i className="section-icon">📞</i> Ward Office Contacts
                  </h3>
                  <div className="profile-grid-2">
                    <div>
                      <label className="stat-label">Ward Mobile</label>
                      <p className="profile-value">
                        {selectedWard?.contact_phone || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="stat-label">Ward Telephone</label>
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

                {/* Section 3: Chairperson Profile */}
                <div className="form-content-section section-chairperson">
                  <h3 className="modern-info-title">
                    <i className="section-icon">👤</i> Chairperson Profile
                  </h3>
                  
                  {/* Photo Display Section */}
                  <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                    <label className="stat-label">Profile Photo</label>
                    {selectedWard?.chairperson_photo ? (
                      <div style={{ marginTop: "10px" }}>
                        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "10px" }}>
                          Photo File: <strong>{selectedWard.chairperson_photo}</strong>
                        </p>
                        <img
                          src={`http://localhost/my-react-app/Backend/api/wards/uploads/${selectedWard.chairperson_photo}`}
                          alt="Chairperson"
                          style={{ maxWidth: "200px", height: "auto", borderRadius: "8px", border: "2px solid #ddd" }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "block";
                          }}
                        />
                        <div style={{ display: "none", padding: "20px", backgroundColor: "#fff3cd", borderRadius: "6px", marginTop: "10px" }}>
                          <p style={{ color: "#856404", margin: "0" }}>⚠️ Photo file not found at upload location</p>
                        </div>
                      </div>
                    ) : (
                      <p style={{ color: "#999", fontSize: "0.9rem", fontStyle: "italic" }}>No photo uploaded</p>
                    )}
                  </div>

                  <div className="chairperson-profile-view">
                    <div className="chairperson-info-grid">
                      <div>
                        <label className="stat-label">Full Name</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Personal Phone</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Personal Email</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_email || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Political Party</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_political_party || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Appointed Date</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_appointment_date
                            ? new Date(
                                selectedWard.chairperson_appointment_date
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Education</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_education || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="stat-label">Experience</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_experience || "N/A"}
                        </p>
                      </div>
                      <div className="field-full">
                        <label className="stat-label">Bio / Message</label>
                        <p className="profile-value">
                          {selectedWard?.chairperson_bio || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modern-form-footer">
                  <button
                    onClick={() => handleEditClick(selectedWard)}
                    className="btn-modern-save"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={resetFormAndClose}
                    className="btn-modern-cancel"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {activeTab === "personal_assets" && (
              <div className="modern-assets-section">
                <ChairpersonPersonalAssets wardId={selectedWard.id} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit/Add View */
        <div className="ward-modern-form-wrapper">
          <div className="ward-form-modern-card">
            <div className="ward-form-header-premium">
              <div className="header-title-group">
                <h2 className="modern-section-title">
                  {isAdding ? "Create New Ward" : "Update Ward Information"}
                </h2>
                <p className="modern-section-subtitle">
                  {isAdding
                    ? "Register a new ward office and chairperson details"
                    : `Modifying Ward ${selectedWard?.ward_number} in ${selectedWard?.district_name}`}
                </p>
              </div>
              <button
                onClick={resetFormAndClose}
                className="btn-modern-close"
                title="Close"
              >
                ✕
              </button>
            </div>

            {!isAdding && (
              <div className="ward-tabs">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`tab-btn ${
                    activeTab === "details" ? "active" : ""
                  }`}
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
              <form onSubmit={handleSave} className="ward-modern-form">
                {/* Section 1: Location & Context */}
                <div className="form-content-section">
                  <h3 className="modern-info-title">
                    <i className="section-icon">📍</i> Office Location Details
                  </h3>
                  <div className="modern-grid-layout">
                    <div className="form-field">
                      <label className="modern-label">Province *</label>
                      <select
                        required
                        value={formProvince}
                        onChange={(e) => {
                          setFormProvince(e.target.value);
                          setFormDistrictName("");
                          setFormData({
                            ...formData,
                            district_id: "",
                            municipality: "",
                            ward_number: "",
                          });
                        }}
                        className="modern-select"
                      >
                        <option value="">-- Select Province --</option>
                        {getProvinces().map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="modern-label">District *</label>
                      <div className="modern-input-with-action">
                        <select
                          required
                          value={formDistrictName}
                          disabled={!formProvince}
                          onChange={(e) => {
                            const dName = e.target.value;
                            setFormDistrictName(dName);
                            // Find matching district ID in our database
                            const dbD = districts.find(
                              (d) =>
                                d.name.toLowerCase() === dName.toLowerCase()
                            );
                            setFormData({
                              ...formData,
                              district_id: dbD ? dbD.id : "",
                              municipality: "",
                              ward_number: "",
                            });
                          }}
                          className="modern-select"
                        >
                          <option value="">-- Select District --</option>
                          {formProvince &&
                            getDistricts(formProvince).map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsAddingDistrict(true)}
                          className="modern-btn-plus"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="form-field">
                      <label className="modern-label">
                        Municipality / Palika *
                      </label>
                      <select
                        required
                        disabled={!formDistrictName}
                        value={formData.municipality}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            municipality: e.target.value,
                            ward_number: "",
                          })
                        }
                        className="modern-select"
                      >
                        <option value="">-- Select Municipality --</option>
                        {formDistrictName &&
                          getMunicipalities(formProvince, formDistrictName).map(
                            (m) => (
                              <option key={m.name} value={m.name}>
                                {m.name}
                              </option>
                            )
                          )}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Ward Number *</label>
                      <select
                        required
                        disabled={!formData.municipality}
                        value={formData.ward_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ward_number: e.target.value,
                          })
                        }
                        className="modern-select"
                      >
                        <option value="">-- Select Ward --</option>
                        {availableWardNumbers.map((n) => (
                          <option key={n} value={n}>
                            Ward {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Office Name</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        className="modern-input"
                        placeholder="e.g. Near Kalanki Chowk"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Google Maps Link</label>
                      <input
                        type="url"
                        value={formData.google_map_link}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            google_map_link: e.target.value,
                          })
                        }
                        className="modern-input"
                        placeholder="https://maps.app.goo.gl/..."
                      />
                    </div>
                  </div>
                </div>
                {/* Section 2: Contact Info */}
                <div className="form-content-section section-contacts">
                  <h3 className="modern-info-title">
                    <i className="section-icon">📞</i> Ward Office Contacts
                  </h3>
                  <div className="modern-grid-layout">
                    <div className="form-field">
                      <label className="modern-label">Ward Mobile</label>
                      <input
                        type="text"
                        value={formData.contact_phone}
                        onChange={(e) => handleNumericInput(e, "contact_phone")}
                        className="modern-input"
                        placeholder="98XXXXXXXX"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Ward Telephone</label>
                      <input
                        type="text"
                        value={formData.telephone}
                        onChange={(e) => handleNumericInput(e, "telephone")}
                        className="modern-input"
                        placeholder="01-XXXXXXX"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Office Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contact_email: e.target.value,
                          })
                        }
                        className="modern-input"
                        placeholder="office@ward.gov.np"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Chairperson Profile */}
                <div className="form-content-section section-chairperson">
                  <h3 className="modern-info-title">
                    <i className="section-icon">👤</i> Chairperson Profile
                  </h3>
                  <div className="modern-grid-layout">
                    <div className="form-field">
                      <label className="modern-label">Full Name</label>
                      <input
                        type="text"
                        value={formData.chairperson_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_name: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setProfilePhotoFile(e.target.files[0]);
                          }
                        }}
                        className="modern-file-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Personal Phone</label>
                      <input
                        type="text"
                        value={formData.chairperson_phone}
                        onChange={(e) =>
                          handleNumericInput(e, "chairperson_phone")
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Personal Email</label>
                      <input
                        type="email"
                        value={formData.chairperson_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_email: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Political Party</label>
                      <input
                        type="text"
                        value={formData.chairperson_political_party}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_political_party: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Appointed Date</label>
                      <input
                        type="date"
                        value={formData.chairperson_appointment_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_appointment_date: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Education</label>
                      <input
                        type="text"
                        value={formData.chairperson_education}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_education: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="modern-label">Experience</label>
                      <input
                        type="text"
                        value={formData.chairperson_experience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_experience: e.target.value,
                          })
                        }
                        className="modern-input"
                      />
                    </div>
                    <div className="form-field field-full">
                      <label className="modern-label">Bio / Message</label>
                      <textarea
                        rows="3"
                        value={formData.chairperson_bio}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            chairperson_bio: e.target.value,
                          })
                        }
                        className="modern-textarea"
                      />
                    </div>
                  </div>
                </div>

                <div className="modern-form-footer">
                  <button
                    type="button"
                    onClick={resetFormAndClose}
                    className="btn-modern-cancel"
                  >
                    Discard Changes
                  </button>
                  <button type="submit" className="btn-modern-save">
                    {isAdding ? "Create Ward Now" : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "personal_assets" && (
              <div className="modern-assets-section">
                <ChairpersonPersonalAssets wardId={selectedWard.id} />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default WardManagement;
