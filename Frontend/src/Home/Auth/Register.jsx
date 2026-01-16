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
import { toast } from "react-toastify";

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

  // Work Address (Office Location)
  const [workProvince, setWorkProvince] = useState("");
  const [workDistrict, setWorkDistrict] = useState("");
  const [workMunicipality, setWorkMunicipality] = useState("");
  const [workWard, setWorkWard] = useState("");
  const [workOfficeLocation, setWorkOfficeLocation] = useState("");
  const [availableWorkWards, setAvailableWorkWards] = useState([]);

  const [idCardPhoto, setIdCardPhoto] = useState(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Preview URLs for images
  const [citizenshipPreview, setCitizenshipPreview] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

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

  // Work Address Handlers
  const handleWorkProvinceChange = (e) => {
    setWorkProvince(e.target.value);
    setWorkDistrict("");
    setWorkMunicipality("");
    setWorkWard("");
    setAvailableWorkWards([]);
  };

  const handleWorkDistrictChange = (e) => {
    setWorkDistrict(e.target.value);
    setWorkMunicipality("");
    setWorkWard("");
    setAvailableWorkWards([]);
  };

  const handleWorkMunicipalityChange = (e) => {
    const muniName = e.target.value;
    setWorkMunicipality(muniName);
    setWorkWard("");

    if (muniName && workDistrict) {
      const muniInfo = getMunicipalityInfo(workDistrict, muniName);
      const count = muniInfo ? muniInfo.wards : 0;
      const wards = Array.from({ length: count }, (_, i) => i + 1);
      setAvailableWorkWards(wards);
    } else {
      setAvailableWorkWards([]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Required";
    if (!lastName.trim()) newErrors.lastName = "Required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) newErrors.email = "Invalid email";
    if (password.length < 8) newErrors.password = "Min 8 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
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
      if (!workProvince) newErrors.workProvince = "Required";
      if (!workDistrict) newErrors.workDistrict = "Required";
      if (!workMunicipality) newErrors.workMunicipality = "Required";
      if (!workWard) newErrors.workWard = "Required";
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

      // Append Profile Photo if exists
      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      if (role === "officer") {
        formData.append("officerId", officerId);
        formData.append("department", department);
        formData.append("workProvince", workProvince);
        formData.append("workDistrict", workDistrict);
        formData.append("workMunicipality", workMunicipality);
        formData.append("workWard", workWard);
        formData.append("workOfficeLocation", workOfficeLocation);
        formData.append("idCardPhoto", idCardPhoto);
      }

      const res = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          role === "officer"
            ? "Registration successful! Your account is pending Admin approval."
            : "Registration successful!"
        );
        // Redirect to Login after 1.5 seconds
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        // Handle specific field errors if returned, otherwise general
        if (data.message.includes("email")) {
          setErrors({ email: data.message });
          toast.error(data.message);
        } else {
          toast.error(data.message || "Registration failed");
        }
        setIsLoading(false);
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
      setIsLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profilePhoto: "File too large (Max 5MB)" });
        return;
      }
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
      if (errors.profilePhoto) {
        const newErrors = { ...errors };
        delete newErrors.profilePhoto;
        setErrors(newErrors);
      }
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

      {/* LEFT PANEL: Branding & Welcome */}
      <div className="register-left-panel">
        {/* Animated Background Gradient */}
        <div className="animated-gradient-bg"></div>

        {/* Overlay for better text readability */}
        <div className="video-overlay"></div>

        <div className="brand-content">
          <div className="logo-circle">
            <i className="fa-solid fa-building-columns"></i>
          </div>
          <h1>Digital Ward</h1>
          <p>Streamlining Local Governance</p>
          <div className="brand-features">
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>Easy Registration</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>Secure Data</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>Quick Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Scrollable Form */}
      <div className="register-right-panel">
        <div className="register-container">
          <div className="register-header">
            <h1>Create Account</h1>
            <p className="subtitle">Join us today! Enter your details below.</p>
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
                      className={`form-control ${
                        errors.lastName ? "error" : ""
                      }`}
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
                  <label>Profile Picture</label>
                  <label className="file-upload-wrapper">
                    <input
                      type="file"
                      className="file-input"
                      onChange={handleProfilePhotoChange}
                      accept="image/*"
                      hidden
                    />
                    <div className="file-upload-icon">
                      {profilePreview ? (
                        <div className="preview-container">
                          <img
                            src={profilePreview}
                            alt="Profile"
                            className="img-preview"
                          />
                          <span className="file-name">
                            {profilePhoto ? profilePhoto.name : "Profile Photo"}
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
                  {errors.profilePhoto && (
                    <p className="error-message show">{errors.profilePhoto}</p>
                  )}
                </div>
              </div>

              <div className="form-row two-cols">
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
              </div>

              <div className="form-row two-cols">
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
                <div className="form-group">
                  <label>Gender *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-venus-mars"></i>
                    <select
                      className={`form-control ${errors.gender ? "error" : ""}`}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="" disabled hidden>
                        Select Gender
                      </option>
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

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>Province *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-map"></i>
                    <select
                      className={`form-control ${
                        errors.province ? "error" : ""
                      }`}
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

                <div className="form-group">
                  <label>District *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-map-pin"></i>
                    <select
                      className={`form-control ${
                        errors.district ? "error" : ""
                      }`}
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
              </div>

              <div className="form-row two-cols">
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
                        className={`form-control ${
                          errors.officerId ? "error" : ""
                        }`}
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder="OFF-XXXX"
                      />
                    </div>
                    {errors.officerId && (
                      <p className="error-message show">{errors.officerId}</p>
                    )}
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
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Public Safety">Public Safety</option>
                        <option value="Environmental Services">
                          Environmental Services
                        </option>
                        <option value="IT">Information Technology</option>
                        <option value="Social Services">Social Services</option>
                        <option value="Urban Planning">Urban Planning</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {errors.department && (
                      <p className="error-message show">{errors.department}</p>
                    )}
                  </div>
                </div>

                <h3
                  className="section-title"
                  style={{ fontSize: "1rem", marginTop: "20px" }}
                >
                  Work/Office Location
                </h3>
                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Province *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-map"></i>
                      <select
                        className={`form-control ${
                          errors.workProvince ? "error" : ""
                        }`}
                        value={workProvince}
                        onChange={handleWorkProvinceChange}
                      >
                        <option value="">Select Province</option>
                        {getProvinces().map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.workProvince && (
                      <p className="error-message show">
                        {errors.workProvince}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>District *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-map-pin"></i>
                      <select
                        className={`form-control ${
                          errors.workDistrict ? "error" : ""
                        }`}
                        value={workDistrict}
                        onChange={handleWorkDistrictChange}
                        disabled={!workProvince}
                      >
                        <option value="">Select District</option>
                        {workProvince &&
                          getDistricts(workProvince).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                      </select>
                    </div>
                    {errors.workDistrict && (
                      <p className="error-message show">
                        {errors.workDistrict}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Municipality *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-city"></i>
                      <select
                        className={`form-control ${
                          errors.workMunicipality ? "error" : ""
                        }`}
                        value={workMunicipality}
                        onChange={handleWorkMunicipalityChange}
                        disabled={!workDistrict}
                      >
                        <option value="">Select Municipality</option>
                        {workDistrict &&
                          getMunicipalities(workProvince, workDistrict).map(
                            (m) => (
                              <option key={m.name} value={m.name}>
                                {m.name}
                              </option>
                            )
                          )}
                      </select>
                    </div>
                    {errors.workMunicipality && (
                      <p className="error-message show">
                        {errors.workMunicipality}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Ward No *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-house"></i>
                      <select
                        className={`form-control ${
                          errors.workWard ? "error" : ""
                        }`}
                        value={workWard}
                        onChange={(e) => setWorkWard(e.target.value)}
                        disabled={!workMunicipality}
                      >
                        <option value="">Select Ward</option>
                        {availableWorkWards.map((num) => (
                          <option key={num} value={num}>
                            Ward {num}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.workWard && (
                      <p className="error-message show">{errors.workWard}</p>
                    )}
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>Office Location/Address</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-building"></i>
                      <input
                        type="text"
                        className="form-control"
                        value={workOfficeLocation}
                        onChange={(e) => setWorkOfficeLocation(e.target.value)}
                        placeholder="Building name, floor, room no"
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
                            <span className="file-name">
                              {idCardPhoto.name}
                            </span>
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
                      className={`form-control ${
                        errors.password ? "error" : ""
                      }`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && (
                    <p className="error-message show">{errors.password}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-shield-halved"></i>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${
                        errors.confirmPassword ? "error" : ""
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="error-message show">
                      {errors.confirmPassword}
                    </p>
                  )}
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
    </div>
  );
}
