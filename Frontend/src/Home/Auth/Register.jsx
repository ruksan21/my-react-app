import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
  getMunicipalityInfo,
} from "../../data/nepal_locations";
import API_ENDPOINTS from "../../config/api";

export default function RegisterPage({
  initialRole = "citizen",
  hideRoleSelector = false,
}) {
  const navigate = useNavigate();

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
  const [province, setProvince] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [availableWardNumbers, setAvailableWardNumbers] = useState([]);

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

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setDistrict("");
    setCity("");
    setWardNumber("");
    setAvailableWardNumbers([]);
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setCity("");
    setWardNumber("");
    setAvailableWardNumbers([]);
  };

  const handleMunicipalityChange = (e) => {
    const muniName = e.target.value;
    setCity(muniName);
    setWardNumber("");

    if (muniName && district) {
      const muniInfo = getMunicipalityInfo(district, muniName);
      const count = muniInfo ? muniInfo.wards : 0;
      const wards = Array.from({ length: count }, (_, i) => i + 1);
      setAvailableWardNumbers(wards);
    } else {
      setAvailableWardNumbers([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Required";
    if (!lastName.trim()) newErrors.lastName = "Required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) newErrors.email = "Invalid email";
    if (password.length < 8) newErrors.password = "Min 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mismatch";
    if (!province) newErrors.province = "Province required";
    if (!district) newErrors.district = "District required";
    if (!city) newErrors.city = "Municipality required";
    if (!wardNumber) newErrors.wardNumber = "Ward required";
    if (!contactNumber.trim()) newErrors.contactNumber = "Required";
    if (!dob) newErrors.dob = "Required";
    if (!gender) newErrors.gender = "Required";
    if (!citizenshipNumber) newErrors.citizenshipNumber = "Required";
    if (!citizenshipIssueDate) newErrors.citizenshipIssueDate = "Required";
    if (!citizenshipIssueDistrict)
      newErrors.citizenshipIssueDistrict = "Required";
    if (!citizenshipPhoto) newErrors.citizenshipPhoto = "Upload required";

    if (role === "officer") {
      if (!officerId.trim()) newErrors.officerId = "Required";
      if (!department) newErrors.department = "Required";
      if (!assignedWard) newErrors.assignedWard = "Required";
      if (!idCardPhoto) newErrors.idCardPhoto = "Upload required";
    }

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
      formData.append("province", province);
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

      const res = await fetch(API_ENDPOINTS.auth.register, {
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
                <label>Phone Number *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-phone"></i>
                  <input
                    type="tel"
                    className={`form-control ${
                      errors.contactNumber ? "error" : ""
                    }`}
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
                {errors.contactNumber && (
                  <p className="error-message show">{errors.contactNumber}</p>
                )}
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-calendar"></i>
                  <input
                    type="date"
                    className={`form-control ${errors.dob ? "error" : ""}`}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                {errors.dob && (
                  <p className="error-message show">{errors.dob}</p>
                )}
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Gender *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-venus-mars"></i>
                  <select
                    className={`form-control ${errors.gender ? "error" : ""}`}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {errors.gender && (
                  <p className="error-message show">{errors.gender}</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Address & Location</h2>

            <div className="form-row">
              <div className="form-group field-full">
                <label>Province *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-map"></i>
                  <select
                    className={`form-control ${errors.province ? "error" : ""}`}
                    name="province"
                    value={province}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Select Province</option>
                    {getProvinces().map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.province && (
                  <p className="error-message show">{errors.province}</p>
                )}
              </div>
            </div>

            <div className="form-row two-cols">
              <div className="form-group">
                <label>District *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-map-pin"></i>
                  <select
                    className={`form-control ${errors.district ? "error" : ""}`}
                    name="district"
                    value={district}
                    onChange={handleDistrictChange}
                    disabled={!province}
                  >
                    <option value="">Select District</option>
                    {province &&
                      getDistricts(province).map((d) => (
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
                    className={`form-control ${errors.city ? "error" : ""}`}
                    name="municipality"
                    value={city}
                    onChange={handleMunicipalityChange}
                    disabled={!district}
                  >
                    <option value="">Select Municipality</option>
                    {district &&
                      getMunicipalities(province, district).map((m) => (
                        <option key={m.name} value={m.name}>
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

            <div className="form-row two-cols">
              <div className="form-group">
                <label>Ward No *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-house"></i>
                  <select
                    className={`form-control ${
                      errors.wardNumber ? "error" : ""
                    }`}
                    name="wardNumber"
                    value={wardNumber}
                    onChange={(e) => setWardNumber(e.target.value)}
                    disabled={!city}
                  >
                    <option value="">Select Ward</option>
                    {availableWardNumbers.map((num) => (
                      <option key={num} value={num}>
                        Ward {num}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.wardNumber && (
                  <p className="error-message show">{errors.wardNumber}</p>
                )}
              </div>
            </div>
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
                <label>Issue Date *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-calendar-check"></i>
                  <input
                    type="date"
                    className={`form-control ${
                      errors.citizenshipIssueDate ? "error" : ""
                    }`}
                    value={citizenshipIssueDate}
                    onChange={(e) => setCitizenshipIssueDate(e.target.value)}
                  />
                </div>
                {errors.citizenshipIssueDate && (
                  <p className="error-message show">
                    {errors.citizenshipIssueDate}
                  </p>
                )}
              </div>
            </div>
            <div className="form-row two-cols">
              <div className="form-group">
                <label>Issue District *</label>
                <div className="input-wrapper">
                  <i className="fa-solid fa-map-pin"></i>
                  <select
                    className={`form-control ${
                      errors.citizenshipIssueDistrict ? "error" : ""
                    }`}
                    value={citizenshipIssueDistrict}
                    onChange={(e) =>
                      setCitizenshipIssueDistrict(e.target.value)
                    }
                  >
                    <option value="">Select District</option>
                    {getProvinces()
                      .map((p) => getDistricts(p))
                      .flat()
                      .sort()
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
                {errors.citizenshipIssueDistrict && (
                  <p className="error-message show">
                    {errors.citizenshipIssueDistrict}
                  </p>
                )}
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
                  <label>Department *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-briefcase"></i>
                    <select
                      className={`form-control ${
                        errors.department ? "error" : ""
                      }`}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select Department</option>
                      <option value="Health">Health</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  {errors.department && (
                    <p className="error-message show">{errors.department}</p>
                  )}
                </div>
              </div>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Assigned Ward *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-map-pin"></i>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.assignedWard ? "error" : ""
                      }`}
                      value={assignedWard}
                      onChange={(e) => setAssignedWard(e.target.value)}
                      placeholder="1-35"
                    />
                  </div>
                  {errors.assignedWard && (
                    <p className="error-message show">{errors.assignedWard}</p>
                  )}
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
