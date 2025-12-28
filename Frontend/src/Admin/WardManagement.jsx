import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import ChairpersonPersonalAssets from "./ChairpersonPersonalAssets";

const WardManagement = () => {
  const API_URL = "http://localhost/my-react-app/Backend/api";

  // State
  const [wards, setWards] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedWard, setSelectedWard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // 'details', 'assets', or 'personal_assets'
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  // Form State for Ward
  const [formData, setFormData] = useState({
    ward_number: "",
    district_id: "",
    location: "",
    contact_phone: "",
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

  // Form State for Asset
  const [assetFormData, setAssetFormData] = useState({
    asset_type: "building",
    asset_name: "",
    description: "",
    value: "",
    acquisition_date: "",
    status: "active",
  });

  useEffect(() => {
    fetchDistricts();
    fetchWards();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${API_URL}/get_districts.php`);
      const data = await res.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch districts:", err);
    }
  };

  const fetchWards = async (districtId = null) => {
    try {
      setIsLoading(true);
      const url = districtId
        ? `${API_URL}/get_wards.php?district_id=${districtId}`
        : `${API_URL}/get_wards.php`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setWards(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch wards:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWardDetails = async (wardId) => {
    try {
      const res = await fetch(`${API_URL}/get_ward_details.php?id=${wardId}`);
      const data = await res.json();
      if (data.success) {
        const ward = data.data;
        setSelectedWard(ward);
        setAssets(ward.assets || []);

        setFormData({
          ward_number: ward.ward_number || "",
          district_id: ward.district_id || "",
          location: ward.location || "",
          contact_phone: ward.contact_phone || "",
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
      }
    } catch (err) {
      console.error("Failed to fetch ward details:", err);
    }
  };

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setSelectedDistrict(value);
    if (value === "all") {
      fetchWards();
    } else {
      fetchWards(parseInt(value));
    }
  };

  const handleEditClick = (ward) => {
    fetchWardDetails(ward.id);
    setIsEditing(true);
    setIsViewingProfile(false);
    setActiveTab("details");
  };

  const handleViewProfile = (ward) => {
    fetchWardDetails(ward.id);
    setIsViewingProfile(true);
    setIsEditing(false);
  };

  const handleAddWardClick = () => {
    setFormData({
      ward_number: "",
      district_id: districts.length > 0 ? districts[0].id : "",
      location: "",
      contact_phone: "",
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

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isAdding ? "add_ward.php" : "update_ward.php";
      const payload = isAdding
        ? formData
        : { id: selectedWard.id, ...formData };

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // If there's a profile photo to upload, upload it separately
        if (profilePhotoFile && selectedWard) {
          await handlePhotoUpload();
        }
        alert(
          isAdding ? "Ward added successfully!" : "Ward updated successfully!"
        );
        setIsEditing(false);
        setIsAdding(false);
        setSelectedWard(null);
        setProfilePhotoFile(null);
        fetchWards(
          selectedDistrict === "all" ? null : parseInt(selectedDistrict)
        );
      } else {
        alert(
          isAdding
            ? "Failed to add ward: " + data.message
            : "Failed to update ward: " + data.message
        );
      }
    } catch (err) {
      alert("Error saving ward.");
      console.error(err);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhotoFile || !selectedWard) return;

    const formData = new FormData();
    formData.append("chairperson_photo", profilePhotoFile);
    formData.append("id", selectedWard.id);

    try {
      const res = await fetch(`${API_URL}/update_ward.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        console.log("Photo uploaded successfully");
      } else {
        alert("Failed to upload photo: " + data.message);
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
    }
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!selectedWard) return;

    try {
      const res = await fetch(`${API_URL}/manage_ward_assets.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ward_id: selectedWard.id,
          ...assetFormData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Asset added successfully!");
        setIsAddingAsset(false);
        setAssetFormData({
          asset_type: "building",
          asset_name: "",
          description: "",
          value: "",
          acquisition_date: "",
          status: "active",
        });
        // Refresh assets
        fetchWardDetails(selectedWard.id);
      } else {
        alert("Failed to add asset: " + data.message);
      }
    } catch (err) {
      alert("Error adding asset.");
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      const res = await fetch(`${API_URL}/manage_ward_assets.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: assetId }),
      });
      const data = await res.json();
      if (data.success) {
        setAssets(assets.filter((a) => a.id !== assetId));
        alert("Asset deleted successfully!");
      } else {
        alert("Failed to delete asset: " + data.message);
      }
    } catch (err) {
      alert("Error deleting asset.");
    }
  };

  const resetFormAndClose = () => {
    setIsEditing(false);
    setIsAdding(false);
    setIsViewingProfile(false);
    setActiveTab("details");
    setSelectedWard(null);
  };

  return (
    <AdminLayout title="Ward Management">
      {!isEditing && !isAdding && !isViewingProfile ? (
        <div className="table-container">
          <div className="table-header-actions">
            <h2 className="section-title">All Wards</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <label style={{ color: "var(--text-muted)" }}>
                Filter by District:
              </label>
              <select
                value={selectedDistrict}
                onChange={handleDistrictChange}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-main)",
                }}
              >
                <option value="all">All Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span style={{ color: "var(--text-muted)" }}>
                Total: {wards.length}
              </span>
              <button
                className="action-btn approve"
                onClick={handleAddWardClick}
                style={{ marginLeft: "auto" }}
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
                  <th>District</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Chairperson</th>
                  <th>Assets</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wards.map((ward) => (
                  <tr key={ward.id}>
                    <td style={{ fontWeight: 600 }}>Ward {ward.ward_number}</td>
                    <td>{ward.district_name}</td>
                    <td>{ward.location || "N/A"}</td>
                    <td>{ward.contact_phone || "N/A"}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          className="profile-avatar-circle"
                          style={{ width: 24, height: 24, fontSize: "0.7rem" }}
                        >
                          {ward.chairperson_name
                            ? ward.chairperson_name.charAt(0)
                            : "?"}
                        </div>
                        {ward.chairperson_name || "Not Assigned"}
                      </div>
                    </td>
                    <td>{ward.total_assets || 0}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="action-btn approve"
                          onClick={() => handleViewProfile(ward)}
                          style={{
                            backgroundColor: "var(--info-color)",
                            fontSize: "0.85rem",
                            padding: "6px 12px",
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="action-btn approve"
                          onClick={() => handleEditClick(ward)}
                          style={{
                            backgroundColor: "var(--admin-accent)",
                            fontSize: "0.85rem",
                            padding: "6px 12px",
                          }}
                        >
                          Edit
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
        /* Profile View */
        <div
          className="stat-card"
          style={{ display: "block", maxWidth: "900px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h2 className="section-title">Chairperson Profile</h2>
            <button
              onClick={resetFormAndClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: "grid", gap: "24px" }}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "20px",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "12px",
              }}
            >
              <div
                className="profile-avatar-circle"
                style={{ width: 80, height: 80, fontSize: "2rem" }}
              >
                {selectedWard?.chairperson_name?.charAt(0) || "?"}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.5rem" }}>
                  {selectedWard?.chairperson_name || "Not Assigned"}
                </h3>
                <p style={{ margin: "4px 0", color: "var(--text-muted)" }}>
                  Ward {selectedWard?.ward_number} Chairperson -{" "}
                  {selectedWard?.district_name}
                </p>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <span>📞 {selectedWard?.chairperson_phone || "N/A"}</span>
                  <span>📧 {selectedWard?.chairperson_email || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                Personal Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label className="stat-label">Education</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.chairperson_education || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="stat-label">Political Party</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.chairperson_political_party || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="stat-label">Experience</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.chairperson_experience || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="stat-label">Appointment Date</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.chairperson_appointment_date || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedWard?.chairperson_bio && (
              <div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                  Bio / Message
                </h3>
                <p style={{ lineHeight: 1.6, color: "var(--text-muted)" }}>
                  {selectedWard.chairperson_bio}
                </p>
              </div>
            )}

            {/* Contact Details */}
            <div>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                Ward Contact Details
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label className="stat-label">Location</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="stat-label">Ward Contact</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.contact_phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="stat-label">Ward Email</label>
                  <p style={{ margin: "4px 0" }}>
                    {selectedWard?.contact_email || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit/Add View */
        <div
          className="stat-card"
          style={{ display: "block", maxWidth: "900px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "24px",
            }}
          >
            <h2 className="section-title">
              {isAdding
                ? "Add New Ward"
                : `Edit Ward ${selectedWard?.ward_number} - ${selectedWard?.district_name}`}
            </h2>
            <button
              onClick={resetFormAndClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs (only show for editing) */}
          {!isAdding && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "20px",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              <button
                onClick={() => setActiveTab("details")}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === "details"
                      ? "3px solid var(--admin-accent)"
                      : "none",
                  color:
                    activeTab === "details"
                      ? "var(--admin-accent)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "details" ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                Ward Details
              </button>
              <button
                onClick={() => setActiveTab("assets")}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === "assets"
                      ? "3px solid var(--admin-accent)"
                      : "none",
                  color:
                    activeTab === "assets"
                      ? "var(--admin-accent)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "assets" ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                Assets ({assets.length})
              </button>
              <button
                onClick={() => setActiveTab("personal_assets")}
                style={{
                  padding: "10px 20px",
                  background: "none",
                  border: "none",
                  borderBottom:
                    activeTab === "personal_assets"
                      ? "3px solid var(--admin-accent)"
                      : "none",
                  color:
                    activeTab === "personal_assets"
                      ? "var(--admin-accent)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "personal_assets" ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                Personal Assets
              </button>
            </div>
          )}

          {/* Details Tab or Add Form */}
          {(activeTab === "details" || isAdding) && (
            <form
              onSubmit={handleSave}
              style={{ display: "grid", gap: "20px" }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Ward Information
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
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
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">District *</label>
                  <select
                    required
                    value={formData.district_id}
                    onChange={(e) =>
                      setFormData({ ...formData, district_id: e.target.value })
                    }
                    disabled={!isAdding}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="stat-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_phone: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_email: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
              </div>

              <hr
                style={{
                  border: "0",
                  borderTop: "1px solid var(--border-color)",
                  margin: "10px 0",
                }}
              />

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Chairperson Details
              </h3>

              {/* Profile Photo Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label className="stat-label">Profile Photo</label>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {selectedWard?.chairperson_photo && (
                    <img
                      src={`${API_URL}/uploads/${selectedWard.chairperson_photo}`}
                      alt="Chairperson"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid var(--border-color)",
                      }}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                    }}
                  />
                  {profilePhotoFile && (
                    <span
                      style={{
                        color: "var(--success-text)",
                        fontSize: "0.9rem",
                      }}
                    >
                      ✓ {profilePhotoFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label className="stat-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.chairperson_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_name: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">Phone</label>
                  <input
                    type="text"
                    value={formData.chairperson_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_phone: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">Email</label>
                  <input
                    type="email"
                    value={formData.chairperson_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_email: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
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
                    placeholder="e.g., Master's Degree (Political Science)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
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
                    placeholder="e.g., Nepali Congress"
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
                <div>
                  <label className="stat-label">Appointment Date</label>
                  <input
                    type="date"
                    value={formData.chairperson_appointment_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chairperson_appointment_date: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      marginTop: "6px",
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="stat-label">Experience</label>
                <textarea
                  rows="2"
                  value={formData.chairperson_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chairperson_experience: e.target.value,
                    })
                  }
                  placeholder="e.g., 15 years in local politics"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    marginTop: "6px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label className="stat-label">Bio / Message</label>
                <textarea
                  rows="4"
                  value={formData.chairperson_bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      chairperson_bio: e.target.value,
                    })
                  }
                  placeholder="Brief message or bio from the chairperson"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    marginTop: "6px",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="action-btn"
                  style={{ backgroundColor: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn approve">
                  {isAdding ? "Add Ward" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {/* Assets Tab */}
          {activeTab === "assets" && !isAdding && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
                  Ward Assets
                </h3>
                <button
                  className="action-btn approve"
                  onClick={() => setIsAddingAsset(true)}
                  style={{ fontSize: "0.9rem" }}
                >
                  + Add Asset
                </button>
              </div>

              {/* Add Asset Form */}
              {isAddingAsset && (
                <form
                  onSubmit={handleAddAsset}
                  style={{
                    marginBottom: "20px",
                    padding: "16px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                  }}
                >
                  <h4 style={{ marginTop: 0 }}>Add New Asset</h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label className="stat-label">Asset Type *</label>
                      <select
                        required
                        value={assetFormData.asset_type}
                        onChange={(e) =>
                          setAssetFormData({
                            ...assetFormData,
                            asset_type: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          marginTop: "4px",
                        }}
                      >
                        <option value="building">Building</option>
                        <option value="vehicle">Vehicle</option>
                        <option value="equipment">Equipment</option>
                        <option value="land">Land</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="stat-label">Asset Name *</label>
                      <input
                        required
                        type="text"
                        value={assetFormData.asset_name}
                        onChange={(e) =>
                          setAssetFormData({
                            ...assetFormData,
                            asset_name: e.target.value,
                          })
                        }
                        placeholder="e.g., Ward Office Building"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          marginTop: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <label className="stat-label">Value (NPR)</label>
                      <input
                        type="number"
                        value={assetFormData.value}
                        onChange={(e) =>
                          setAssetFormData({
                            ...assetFormData,
                            value: e.target.value,
                          })
                        }
                        placeholder="e.g., 5000000"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          marginTop: "4px",
                        }}
                      />
                    </div>
                    <div>
                      <label className="stat-label">Acquisition Date</label>
                      <input
                        type="date"
                        value={assetFormData.acquisition_date}
                        onChange={(e) =>
                          setAssetFormData({
                            ...assetFormData,
                            acquisition_date: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          marginTop: "4px",
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label className="stat-label">Description</label>
                      <textarea
                        rows="2"
                        value={assetFormData.description}
                        onChange={(e) =>
                          setAssetFormData({
                            ...assetFormData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Brief description of the asset"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          marginTop: "4px",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "12px" }}
                  >
                    <button
                      type="submit"
                      className="action-btn approve"
                      style={{ fontSize: "0.9rem" }}
                    >
                      Add Asset
                    </button>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => setIsAddingAsset(false)}
                      style={{
                        backgroundColor: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {assets.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>
                  No assets recorded for this ward.
                </p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Value (NPR)</th>
                      <th>Acquisition Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id}>
                        <td style={{ textTransform: "capitalize" }}>
                          {asset.asset_type}
                        </td>
                        <td>{asset.asset_name}</td>
                        <td>{asset.description || "N/A"}</td>
                        <td>
                          {asset.value
                            ? `NPR ${parseFloat(asset.value).toLocaleString()}`
                            : "N/A"}
                        </td>
                        <td>{asset.acquisition_date || "N/A"}</td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.85rem",
                              backgroundColor:
                                asset.status === "active"
                                  ? "var(--success-bg)"
                                  : asset.status === "maintenance"
                                  ? "var(--warning-bg)"
                                  : "var(--error-bg)",
                              color:
                                asset.status === "active"
                                  ? "var(--success-text)"
                                  : asset.status === "maintenance"
                                  ? "var(--warning-text)"
                                  : "var(--error-text)",
                            }}
                          >
                            {asset.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn delete"
                            onClick={() => handleDeleteAsset(asset.id)}
                            style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Personal Assets Tab */}
          {activeTab === "personal_assets" && !isAdding && (
            <ChairpersonPersonalAssets wardId={selectedWard?.id} />
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default WardManagement;
