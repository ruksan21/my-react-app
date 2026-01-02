import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function RegisterPage({
  initialRole = "citizen",
  hideRoleSelector = false,
}) {
  const navigate = useNavigate();
  const API_URL = "http://localhost/my-react-app/Backend/api";

  const [role, setRole] = useState(
    initialRole === "officer" ? "officer" : "citizen"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [wardNumber, setWardNumber] = useState("");

  const [citizenshipNumber, setCitizenshipNumber] = useState("");
  const [citizenshipIssueDate, setCitizenshipIssueDate] = useState("");
  const [citizenshipIssueDistrict, setCitizenshipIssueDistrict] = useState("");
  const [citizenshipPhoto, setCitizenshipPhoto] = useState(null);

  const [officerId, setOfficerId] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedWard, setAssignedWard] = useState("");
  const [idCardPhoto, setIdCardPhoto] = useState(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Preview URLs for images
  const [citizenshipPreview, setCitizenshipPreview] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);

  const districtMunicipalityData = {
    Kathmandu: [
      { id: 1, name: "Kathmandu Metropolitan City" },
      { id: 2, name: "Lalitpur Metropolitan City" },
      { id: 3, name: "Bhaktapur Municipality" },
    ],
    Kaski: [{ id: 6, name: "Pokhara Metropolitan City" }],
    Morang: [{ id: 8, name: "Biratnagar Metropolitan City" }],
    Chitwan: [{ id: 10, name: "Bharatpur Metropolitan City" }],
  };

  const districts = Object.keys(districtMunicipalityData);
  const getFilteredMunicipalities = () =>
    district ? districtMunicipalityData[district] || [] : [];

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setCity("");
    setWardNumber("");
  };

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Required";
    if (!lastName.trim()) newErrors.lastName = "Required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) newErrors.email = "Invalid email";
    if (password.length < 8) newErrors.password = "Min 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!district) newErrors.district = "Required";
    if (!city) newErrors.city = "Required";
    if (role === "citizen" && !wardNumber) newErrors.wardNumber = "Required";
    if (!citizenshipNumber) newErrors.citizenshipNumber = "Required";
    if (!citizenshipPhoto) newErrors.citizenshipPhoto = "Upload required";
    if (!termsAccepted) newErrors.terms = "Accept terms required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to the first error
      const firstError = document.querySelector(
        ".form-control.error, .error-message.show"
      );
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("role", role);
      formData.append("firstName", firstName);
      formData.append("middleName", middleName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("contactNumber", contactNumber);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("district", district);
      formData.append("city", city);
      formData.append("wardNumber", wardNumber);
      formData.append("citizenshipNumber", citizenshipNumber);
      formData.append("citizenshipIssueDate", citizenshipIssueDate);
      formData.append("citizenshipIssueDistrict", citizenshipIssueDistrict);
      formData.append("citizenshipPhoto", citizenshipPhoto);

      if (role === "officer") {
        formData.append("officerId", officerId);
        formData.append("department", department);
        formData.append("assignedWard", assignedWard);
        formData.append("idCardPhoto", idCardPhoto);
      }

      const res = await fetch(`${API_URL}/register.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setErrors({ submit: data.message || "Registration failed" });
      }
    } catch (err) {
      setErrors({ submit: "Network error: " + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitizenshipPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit to 5MB
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, citizenshipPhoto: "File too large (Max 5MB)" });
        return;
      }
      setCitizenshipPhoto(file);
      setCitizenshipPreview(URL.createObjectURL(file));
      // Clear error once uploaded
      if (errors.citizenshipPhoto) {
        const newErrors = { ...errors };
        delete newErrors.citizenshipPhoto;
        setErrors(newErrors);
      }
    }
  };

  const handleIdCardPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdCardPhoto(file);
      setIdCardPreview(URL.createObjectURL(file));
      // Clear error once uploaded
      if (errors.idCardPhoto) {
        const newErrors = { ...errors };
        delete newErrors.idCardPhoto;
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="register-root">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      {showSuccess && (
        <div className="success-notification show">
          Registration successful!
        </div>
      )}
      {errors.submit && (
        <div className="error-notification show">{errors.submit}</div>
      )}

      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join us today! It takes only few steps</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {!hideRoleSelector && (
            <div className="role-selector">
              <div className="role-options">
                <label
                  className={`role-option ${
                    role === "citizen" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    value="citizen"
                    checked={role === "citizen"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">👤</span>
                  <span className="role-text">Citizen</span>
                </label>
                <label
                  className={`role-option ${
                    role === "officer" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    value="officer"
                    checked={role === "officer"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">👮</span>
                  <span className="role-text">Officer</span>
                </label>
              </div>
            </div>
          )}

          <div className="form-section">
            <h2 className="section-title">Personal Details</h2>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>First Name *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text"
                    name="firstName"
                    className={`form-control ${
                      errors.firstName ? "error" : ""
                    }`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                  />
                </div>
                {errors.firstName && (
                  <p className="error-message show">{errors.firstName}</p>
                )}
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-user"></i>
                  <input
                    type="text"
                    name="lastName"
                    className={`form-control ${errors.lastName ? "error" : ""}`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                  />
                </div>
                {errors.lastName && (
                  <p className="error-message show">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Middle Name</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-user-tag"></i>
                  <input
                    type="text"
                    name="middleName"
                    className="form-control"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? "error" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="error-message show">{errors.email}</p>
                )}
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-phone"></i>
                  <input
                    type="tel"
                    className="form-control"
                    value={contactNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^[0-9]+$/.test(val)) {
                        setContactNumber(val);
                      }
                    }}
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-calendar"></i>
                  <input
                    type="date"
                    className="form-control"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Gender</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-venus-mars"></i>
                  <select
                    className="form-control"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Address & Location</h2>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>District *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-map"></i>
                  <select
                    className="form-control"
                    name="district"
                    value={district}
                    onChange={handleDistrictChange}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.district && (
                  <p className="error-message show">{errors.district}</p>
                )}
              </div>
              <div className="form-group">
                <label>Municipality *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-city"></i>
                  <select
                    className="form-control"
                    name="municipality"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!district}
                  >
                    <option value="">Select Municipality</option>
                    {getFilteredMunicipalities().map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.city && (
                  <p className="error-message show">{errors.city}</p>
                )}
              </div>
            </div>
            {role === "citizen" && (
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Ward No *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-house"></i>
                    <input
                      type="number"
                      name="wardNumber"
                      className={`form-control ${
                        errors.wardNumber ? "error" : ""
                      }`}
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      placeholder="1-35"
                    />
                  </div>
                  {errors.wardNumber && (
                    <p className="error-message show">{errors.wardNumber}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2 className="section-title">Identity Verification</h2>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Citizenship Number *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-id-card"></i>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.citizenshipNumber ? "error" : ""
                    }`}
                    value={citizenshipNumber}
                    onChange={(e) => setCitizenshipNumber(e.target.value)}
                    placeholder="Number"
                    name="citizenshipNumber"
                  />
                </div>
                {errors.citizenshipNumber && (
                  <p className="error-message show">
                    {errors.citizenshipNumber}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-calendar-check"></i>
                  <input
                    type="date"
                    className="form-control"
                    value={citizenshipIssueDate}
                    onChange={(e) => setCitizenshipIssueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Issue District</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-map-pin"></i>
                  <select
                    className="form-control"
                    value={citizenshipIssueDistrict}
                    onChange={(e) =>
                      setCitizenshipIssueDistrict(e.target.value)
                    }
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Citizenship Photo *</label>
                <label className="file-upload-wrapper">
                  <input
                    type="file"
                    className="file-input"
                    onChange={handleCitizenshipPhotoChange}
                    accept="image/*"
                    hidden
                  />
                  <div className="file-upload-icon">
                    {citizenshipPreview ? (
                      <div className="preview-container">
                        <img
                          src={citizenshipPreview}
                          alt="Preview"
                          className="img-preview"
                        />
                        <span className="file-name">
                          {citizenshipPhoto.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <i className="fa-solid fa-camera"></i>
                        <span>Click to Upload</span>
                      </>
                    )}
                  </div>
                </label>
                {errors.citizenshipPhoto && (
                  <p className="error-message show">
                    {errors.citizenshipPhoto}
                  </p>
                )}
              </div>
            </div>
          </div>

          {role === "officer" && (
            <div className="form-section">
              <h2 className="section-title">Officer Credentials</h2>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Officer ID *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-hashtag"></i>
                    <input
                      type="text"
                      className="form-control"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="OFF-XXXX"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-briefcase"></i>
                    <select
                      className="form-control"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="Health">Health</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Assigned Ward</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-map-pin"></i>
                    <input
                      type="number"
                      className="form-control"
                      value={assignedWard}
                      onChange={(e) => setAssignedWard(e.target.value)}
                      placeholder="1-35"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>ID Card Photo *</label>
                  <label className="file-upload-wrapper">
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleIdCardPhotoChange}
                      accept="image/*"
                      hidden
                    />
                    <div className="file-upload-icon">
                      {idCardPreview ? (
                        <div className="preview-container">
                          <img
                            src={idCardPreview}
                            alt="Preview"
                            className="img-preview"
                          />
                          <span className="file-name">{idCardPhoto.name}</span>
                        </div>
                      ) : (
                        <>
                          <i className="fa-solid fa-id-badge"></i>
                          <span>Click to Upload ID</span>
                        </>
                      )}
                    </div>
                  </label>
                  {errors.idCardPhoto && (
                    <p className="error-message show">{errors.idCardPhoto}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h2 className="section-title">Security</h2>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Password *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-shield-halved"></i>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="terms-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />{" "}
              <span>
                I agree to the <Link to="/terms">Terms & Conditions</Link>
              </span>
            </label>
            {errors.terms && (
              <p className="error-message show">{errors.terms}</p>
            )}
          </div>

          <button type="submit" className="btn-register" disabled={isLoading}>
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </form>
        <div className="form-footer">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
