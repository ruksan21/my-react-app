import React, { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../Home/Context/AuthContext";
import { API_ENDPOINTS } from "../config/api";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
} from "../data/nepal_locations";
import "./OfficerManagement.css";

const OfficerManagement = () => {
  const { pendingOfficers, approveOfficer, rejectOfficer } = useAuth();

  // Create Officer State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const initialFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
    dob: "",
    gender: "Male",

    // Address State
    province: "Bagmati Province",
    district: "Kathmandu",
    city: "Kathmandu Metropolitan City",
    wardNumber: "1", // Home Address Ward

    officerId: "",
    department: "",
    assignedWard: "1", // Duty Ward
    citizenshipNumber: "",
    citizenshipIssueDate: "",
    citizenshipIssueDistrict: "Kathmandu",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [photoFiles, setPhotoFiles] = useState({
    citizenship: null,
    idCard: null,
  });

  // Dynamic Options State
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  // Initialize Dropdowns based on default/current selection
  useEffect(() => {
    // 1. Load Districts for selected Province
    const dists = getDistricts(formData.province);
    setDistricts(dists);

    // 2. Load Municipalities for selected District
    const muns = getMunicipalities(formData.province, formData.district);
    setMunicipalities(muns);

    // 3. Load Wards for selected Municipality
    const selectedMun = muns.find((m) => m.name === formData.city);
    const maxWards = selectedMun ? selectedMun.wards : 32;
    setWardsList(Array.from({ length: maxWards }, (_, i) => i + 1));
  }, [formData.province, formData.district, formData.city]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (e) => {
    const newProv = e.target.value;
    const newDists = getDistricts(newProv);
    const firstDist = newDists[0] || "";
    const newMuns = getMunicipalities(newProv, firstDist);
    const firstMun = newMuns[0] ? newMuns[0].name : "";

    setFormData((prev) => ({
      ...prev,
      province: newProv,
      district: firstDist,
      city: firstMun,
      wardNumber: "1",
    }));
  };

  const handleDistrictChange = (e) => {
    const newDist = e.target.value;
    const newMuns = getMunicipalities(formData.province, newDist);
    const firstMun = newMuns[0] ? newMuns[0].name : "";

    setFormData((prev) => ({
      ...prev,
      district: newDist,
      city: firstMun,
      wardNumber: "1",
    }));
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value; // Municipality Name
    setFormData((prev) => ({
      ...prev,
      city: newCity,
      wardNumber: "1",
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setPhotoFiles((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.officerId ||
      !formData.password
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (photoFiles.citizenship)
      data.append("citizenshipPhoto", photoFiles.citizenship);
    if (photoFiles.idCard) data.append("idCardPhoto", photoFiles.idCard);

    try {
      const res = await fetch(API_ENDPOINTS.officers.add, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        alert("Officer created successfully!");
        setShowCreateModal(false);
        setFormData(initialFormState);
        setPhotoFiles({ citizenship: null, idCard: null });
      } else {
        alert("Error creating officer: " + result.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit form.");
    }
  };

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this officer?")) {
      approveOfficer(id);
    }
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      rejectOfficer(id);
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge ${status.toLowerCase()}`}>{status}</span>;
  };

  return (
    <AdminLayout title="Officer Applications">
      {/* Create Officer Modal Overlay */}
      {showCreateModal && (
        <div className="officer-modal-overlay">
          <div className="stat-card officer-modal-content">
            <div className="officer-modal-header">
              <h2 className="section-title officer-modal-title">
                Create New Officer Profile
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="officer-close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="officer-form-grid">
              {/* 1. Personal Details */}
              <div className="form-section">
                <h3 className="form-section-header">Personal Information</h3>
                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Middle Name</label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="two-col-grid">
                  <div>
                    <label className="stat-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Contact & Address (UPDATED) */}
              <div className="form-section">
                <h3 className="form-section-header">Contact & Address</h3>
                <div className="two-col-grid" style={{ marginTop: 0 }}>
                  <div>
                    <label className="stat-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Mobile Number</label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Dynamic Address Selection */}
                <div className="two-col-grid">
                  <div>
                    <label className="stat-label">Province</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleProvinceChange}
                      className="form-input"
                    >
                      {getProvinces().map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="stat-label">District</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      className="form-input"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="municipality-grid">
                  <div>
                    <label className="stat-label">
                      Municipality / Nagarpalika
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleCityChange}
                      className="municipality-select"
                    >
                      <option value="">Select Municipality</option>
                      {municipalities.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="stat-label">Ward No. (Home)</label>
                    <select
                      name="wardNumber"
                      value={formData.wardNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {wardsList.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Official Details */}
              <div className="form-section">
                <h3 className="form-section-header">OFFICIAL ASSIGNMENT</h3>
                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">Officer ID *</label>
                    <input
                      type="text"
                      name="officerId"
                      value={formData.officerId}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="OFF-202X-000"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Assigned Ward *</label>
                    <select
                      name="assignedWard"
                      value={formData.assignedWard}
                      onChange={handleInputChange}
                      className="form-input assigned-ward-select"
                    >
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Ward {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="password-section">
                  <label className="stat-label">Login Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Set initial password"
                  />
                </div>
              </div>

              {/* 4. Citizenship & Documents */}
              <div className="form-section">
                <h3 className="form-section-header">Documents</h3>
                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">Citizenship No.</label>
                    <input
                      type="text"
                      name="citizenshipNumber"
                      value={formData.citizenshipNumber}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Issue Date</label>
                    <input
                      type="date"
                      name="citizenshipIssueDate"
                      value={formData.citizenshipIssueDate}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Issue District</label>
                    <input
                      type="text"
                      name="citizenshipIssueDistrict"
                      value={formData.citizenshipIssueDistrict}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="two-col-grid">
                  <div>
                    <label className="stat-label">Citizenship Photo</label>
                    <input
                      type="file"
                      name="citizenship"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="form-input file-input-wrapper"
                    />
                  </div>
                  <div>
                    <label className="stat-label">Officer ID Card Photo</label>
                    <input
                      type="file"
                      name="idCard"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="form-input file-input-wrapper"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="action-btn btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn approve btn-create">
                  Create Officer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-actions">
          <div>
            <h2 className="section-title">Pending Officer Applications</h2>
            <span className="pending-count">
              {pendingOfficers.length} pending applications
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create New Officer
          </button>
        </div>

        {pendingOfficers.length === 0 ? (
          <div className="no-data">
            No pending officer applications at the moment.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Officer ID</th>
                <th>Department</th>
                <th>Ward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingOfficers.map((officer) => (
                <tr key={officer.id}>
                  <td className="officer-name-cell">{officer.name}</td>
                  <td>{officer.email}</td>
                  <td>{officer.employeeId || officer.officerId || "N/A"}</td>
                  <td>{officer.department || "General"}</td>
                  <td>{officer.ward}</td>
                  <td>{getStatusBadge(officer.status)}</td>
                  <td>
                    <button
                      className="action-btn approve"
                      onClick={() => handleApprove(officer.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="action-btn reject"
                      onClick={() => handleReject(officer.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default OfficerManagement;
