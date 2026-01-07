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
  const {
    pendingOfficers,
    approveOfficer,
    rejectOfficer,
    fetchPendingOfficers,
  } = useAuth();

  // Create Officer State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const initialFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    dob: "",
    gender: "Male",

    // Residential Address State
    province: "Bagmati Province",
    district: "Kathmandu",
    city: "Kathmandu Metropolitan City",
    wardNumber: "1",

    // Officer Details
    officerId: "",
    department: "",

    // Work/Office Location
    workProvince: "Bagmati Province",
    workDistrict: "Kathmandu",
    workMunicipality: "Kathmandu Metropolitan City",
    workWard: "1",
    workOfficeLocation: "",

    // Citizenship Details
    citizenshipNumber: "",
    citizenshipIssueDate: "",
    citizenshipIssueDistrict: "Kathmandu",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [photoFiles, setPhotoFiles] = useState({
    citizenship: null,
    idCard: null,
    profilePhoto: null,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Options State
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wardsList, setWardsList] = useState([]);

  // Initialize Dropdowns based on default/current selection
  useEffect(() => {
    const dists = getDistricts(formData.province);
    setDistricts(dists);

    const muns = getMunicipalities(formData.province, formData.district);
    setMunicipalities(muns);

    const selectedMun = muns.find((m) => m.name === formData.city);
    const maxWards = selectedMun ? selectedMun.wards : 32;
    setWardsList(Array.from({ length: maxWards }, (_, i) => i + 1));
  }, [formData.province, formData.district, formData.city]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
    const newCity = e.target.value;
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
      // Clear file error
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation checks
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Mobile number is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";

    // Citizenship validation
    if (!formData.citizenshipNumber.trim()) newErrors.citizenshipNumber = "Citizenship number is required";
    if (!formData.citizenshipIssueDate) newErrors.citizenshipIssueDate = "Citizenship issue date is required";
    if (!formData.citizenshipIssueDistrict.trim()) newErrors.citizenshipIssueDistrict = "Issue district is required";

    // Official details validation
    if (!formData.officerId.trim()) newErrors.officerId = "Officer ID is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.workProvince) newErrors.workProvince = "Work province is required";
    if (!formData.workDistrict) newErrors.workDistrict = "Work district is required";
    if (!formData.workMunicipality) newErrors.workMunicipality = "Work municipality is required";
    if (!formData.workWard) newErrors.workWard = "Work ward is required";

    // Password validation
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    // Photo validation
    if (!photoFiles.citizenship) newErrors.citizenship = "Citizenship photo is required";
    if (!photoFiles.idCard) newErrors.idCard = "Officer ID card photo is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (photoFiles.citizenship)
      data.append("citizenshipPhoto", photoFiles.citizenship);
    if (photoFiles.idCard) data.append("idCardPhoto", photoFiles.idCard);
    if (photoFiles.profilePhoto)
      data.append("profilePhoto", photoFiles.profilePhoto);

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
        setPhotoFiles({ citizenship: null, idCard: null, profilePhoto: null });
        setErrors({});
        if (fetchPendingOfficers) {
          fetchPendingOfficers();
        }
      } else {
        setErrors({ submit: result.message || "Error creating officer" });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setErrors({ submit: "Failed to submit form. " + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm("Are you sure you want to approve this officer?")) {
      await approveOfficer(id);
      if (fetchPendingOfficers) {
        fetchPendingOfficers();
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      await rejectOfficer(id);
      if (fetchPendingOfficers) {
        fetchPendingOfficers();
      }
    }
  };

  const handleEditOfficer = (officer) => {
    // Pre-populate form with officer data
    setFormData((prev) => ({
      ...prev,
      firstName: officer.firstName || officer.first_name || "",
      lastName: officer.lastName || officer.last_name || "",
      email: officer.email || "",
      officerId: officer.officerId || officer.officer_id || "",
      department: officer.department || "",
      workProvince: officer.work_province || "Bagmati Province",
      workDistrict: officer.work_district || "Kathmandu",
      workMunicipality: officer.work_municipality || "Kathmandu Metropolitan City",
      workWard: officer.work_ward || "1",
      workOfficeLocation: officer.work_office_location || "",
      contactNumber: officer.contactNumber || officer.contact_number || "",
      citizenshipNumber: officer.citizenshipNumber || officer.citizenship_number || "",
    }));
    setShowCreateModal(true);
  };

  const getStatusBadge = (status) => {
    return <span className={`badge ${status.toLowerCase()}`}>{status}</span>;
  };

  const renderErrorMessage = (fieldName) => {
    if (errors[fieldName]) {
      return (
        <span style={{ color: "red", fontSize: "0.85rem", marginTop: "4px", display: "block" }}>
          {errors[fieldName]}
        </span>
      );
    }
    return null;
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
              {/* Error Display */}
              {errors.submit && (
                <div
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    fontSize: "0.9rem",
                  }}
                >
                  {errors.submit}
                </div>
              )}

              {/* 1. Personal Details */}
              <div className="form-section">
                <h3 className="form-section-header">Personal Information</h3>

                {/* Profile Photo Upload */}
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                  <label className="stat-label">Profile Photo</label>
                  <input
                    type="file"
                    name="profilePhoto"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="form-input"
                    style={{ maxWidth: "300px", margin: "0 auto" }}
                  />
                </div>

                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">First Name <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.firstName ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("firstName")}
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
                    <label className="stat-label">Last Name <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`form-input ${errors.lastName ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("lastName")}
                  </div>
                </div>

                <div className="two-col-grid">
                  <div>
                    <label className="stat-label">Date of Birth <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className={`form-input ${errors.dob ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("dob")}
                  </div>
                  <div>
                    <label className="stat-label">Gender <span style={{ color: "red" }}>*</span></label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`form-input ${errors.gender ? "input-error" : ""}`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {renderErrorMessage("gender")}
                  </div>
                </div>
              </div>

              {/* 2. Contact & Address */}
              <div className="form-section">
                <h3 className="form-section-header">Contact & Address</h3>
                <div className="two-col-grid" style={{ marginTop: 0 }}>
                  <div>
                    <label className="stat-label">Email <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("email")}
                  </div>
                  <div>
                    <label className="stat-label">Mobile Number <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className={`form-input ${errors.contactNumber ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("contactNumber")}
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
                    <label className="stat-label">Municipality / Nagarpalika</label>
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
                    <label className="stat-label">Officer ID <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="officerId"
                      value={formData.officerId}
                      onChange={handleInputChange}
                      className={`form-input ${errors.officerId ? "input-error" : ""}`}
                      placeholder="OFF-202X-000"
                    />
                    {renderErrorMessage("officerId")}
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
                </div>

                {/* Work/Office Location Section */}
                <h4 style={{ marginTop: "25px", marginBottom: "15px", fontSize: "1rem", fontWeight: "600" }}>Work/Office Location</h4>
                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">Work Province <span style={{ color: "red" }}>*</span></label>
                    <select
                      name="workProvince"
                      value={formData.workProvince}
                      onChange={(e) => {
                        const newProv = e.target.value;
                        const newDists = getDistricts(newProv);
                        const firstDist = newDists[0] || "";
                        const newMuns = getMunicipalities(newProv, firstDist);
                        const firstMun = newMuns[0] ? newMuns[0].name : "";
                        setFormData((prev) => ({
                          ...prev,
                          workProvince: newProv,
                          workDistrict: firstDist,
                          workMunicipality: firstMun,
                          workWard: "1",
                        }));
                      }}
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
                    <label className="stat-label">Work District <span style={{ color: "red" }}>*</span></label>
                    <select
                      name="workDistrict"
                      value={formData.workDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        const newMuns = getMunicipalities(formData.workProvince, newDist);
                        const firstMun = newMuns[0] ? newMuns[0].name : "";
                        setFormData((prev) => ({
                          ...prev,
                          workDistrict: newDist,
                          workMunicipality: firstMun,
                          workWard: "1",
                        }));
                      }}
                      className="form-input"
                    >
                      {getDistricts(formData.workProvince).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="stat-label">Work Municipality <span style={{ color: "red" }}>*</span></label>
                    <select
                      name="workMunicipality"
                      value={formData.workMunicipality}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          workMunicipality: e.target.value,
                          workWard: "1",
                        }));
                      }}
                      className="form-input"
                    >
                      {getMunicipalities(formData.workProvince, formData.workDistrict).map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="three-col-grid" style={{ marginTop: "15px" }}>
                  <div>
                    <label className="stat-label">Work Ward No <span style={{ color: "red" }}>*</span></label>
                    <select
                      name="workWard"
                      value={formData.workWard}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      {(() => {
                        const mun = getMunicipalities(formData.workProvince, formData.workDistrict).find(m => m.name === formData.workMunicipality);
                        const wardCount = mun ? mun.wards : 32;
                        return Array.from({ length: wardCount }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            Ward {n}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="stat-label">Office Location/Address</label>
                    <input
                      type="text"
                      name="workOfficeLocation"
                      value={formData.workOfficeLocation}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Building name, floor, room no"
                    />
                  </div>
                </div>
                <div className="password-section">
                  <label className="stat-label">Login Password <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input ${errors.password ? "input-error" : ""}`}
                    placeholder="Set initial password (Min 8 characters)"
                  />
                  {renderErrorMessage("password")}
                </div>
                <div className="password-section">
                  <label className="stat-label">Confirm Password <span style={{ color: "red" }}>*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? "input-error" : ""}`}
                    placeholder="Confirm password"
                  />
                  {renderErrorMessage("confirmPassword")}
                </div>
              </div>

              {/* 4. Citizenship & Documents */}
              <div className="form-section">
                <h3 className="form-section-header">Documents</h3>
                <div className="three-col-grid">
                  <div>
                    <label className="stat-label">Citizenship No. <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="citizenshipNumber"
                      value={formData.citizenshipNumber}
                      onChange={handleInputChange}
                      className={`form-input ${errors.citizenshipNumber ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("citizenshipNumber")}
                  </div>
                  <div>
                    <label className="stat-label">Issue Date <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="date"
                      name="citizenshipIssueDate"
                      value={formData.citizenshipIssueDate}
                      onChange={handleInputChange}
                      className={`form-input ${errors.citizenshipIssueDate ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("citizenshipIssueDate")}
                  </div>
                  <div>
                    <label className="stat-label">Issue District <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="text"
                      name="citizenshipIssueDistrict"
                      value={formData.citizenshipIssueDistrict}
                      onChange={handleInputChange}
                      className={`form-input ${errors.citizenshipIssueDistrict ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("citizenshipIssueDistrict")}
                  </div>
                </div>
                <div className="two-col-grid">
                  <div>
                    <label className="stat-label">Citizenship Photo <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="file"
                      name="citizenship"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={`form-input file-input-wrapper ${errors.citizenship ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("citizenship")}
                  </div>
                  <div>
                    <label className="stat-label">Officer ID Card Photo <span style={{ color: "red" }}>*</span></label>
                    <input
                      type="file"
                      name="idCard"
                      onChange={handleFileChange}
                      accept="image/*"
                      className={`form-input file-input-wrapper ${errors.idCard ? "input-error" : ""}`}
                    />
                    {renderErrorMessage("idCard")}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="action-btn btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn approve btn-create" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Officer Profile"}
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
            onClick={() => {
              setShowCreateModal(true);
              setFormData(initialFormState);
              setPhotoFiles({ citizenship: null, idCard: null, profilePhoto: null });
              setErrors({});
            }}
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
                <th>Work Location</th>
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
                  <td>
                    {officer.work_municipality
                      ? `${officer.work_municipality}, Ward ${officer.work_ward || ""}`
                      : officer.work_ward
                      ? `Ward ${officer.work_ward}`
                      : "N/A"}
                  </td>
                  <td>{getStatusBadge(officer.status)}</td>
                  <td>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditOfficer(officer)}
                      title="Edit and assign ward"
                    >
                      Edit
                    </button>
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
