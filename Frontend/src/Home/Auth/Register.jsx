import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import {
  getProvinces,
  getDistricts,
  getMunicipalities,
  getMunicipalityInfo,
  toNepaliNumber,
} from "../../data/nepal_locations";
import API_ENDPOINTS from "../../config/api";
import { toast } from "react-toastify";
import { useLanguage } from "../Context/useLanguage";

export default function RegisterPage({
  initialRole = "citizen",
  hideRoleSelector = false,
}) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [role, setRole] = useState(
    initialRole === "officer" ? "officer" : "citizen",
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
    if (!firstName.trim()) newErrors.firstName = t("auth.required");
    if (!lastName.trim()) newErrors.lastName = t("auth.required");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(email)) newErrors.email = t("auth.email_invalid");
    if (password.length < 8) newErrors.password = t("auth.password_min");
    if (password !== confirmPassword)
      newErrors.confirmPassword = t("auth.password_mismatch");
    if (!province) newErrors.province = t("auth.province_required");
    if (!district) newErrors.district = t("auth.district_required");
    if (!city) newErrors.city = t("auth.muni_required");
    if (!wardNumber) newErrors.wardNumber = t("auth.ward_required");
    if (!contactNumber.trim()) newErrors.contactNumber = t("auth.required");
    if (!dob) newErrors.dob = t("auth.required");
    if (!gender) newErrors.gender = t("auth.required");
    if (!citizenshipNumber) newErrors.citizenshipNumber = t("auth.required");
    if (!citizenshipIssueDate)
      newErrors.citizenshipIssueDate = t("auth.required");
    if (!citizenshipIssueDistrict)
      newErrors.citizenshipIssueDistrict = t("auth.required");
    if (!citizenshipPhoto)
      newErrors.citizenshipPhoto = t("auth.upload_required");

    if (role === "officer") {
      if (!officerId.trim()) newErrors.officerId = t("auth.required");
      if (!department) newErrors.department = t("auth.required");
      if (!workProvince) newErrors.workProvince = t("auth.required");
      if (!workDistrict) newErrors.workDistrict = t("auth.required");
      if (!workMunicipality) newErrors.workMunicipality = t("auth.required");
      if (!workWard) newErrors.workWard = t("auth.required");
      if (!idCardPhoto) newErrors.idCardPhoto = t("auth.upload_required");
    }

    if (!termsAccepted) newErrors.terms = t("auth.accept_terms");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      // Scroll to the first error
      const firstError = document.querySelector(
        ".form-control.error, .error-message.show",
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
            ? t("auth.registration_pending")
            : t("auth.registration_success"),
        );
        // Redirect to Login after 1.5 seconds
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      } else {
        // Handle specific field errors if returned, otherwise general
        if (data.message.includes("email")) {
          setErrors({ email: data.message });
          toast.error(data.message);
        } else {
          toast.error(data.message || t("auth.registration_failed"));
        }
        setIsLoading(false);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(t("auth.network_error") + err.message);
      setIsLoading(false);
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, profilePhoto: t("auth.file_too_large") });
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
        setErrors({ ...errors, citizenshipPhoto: t("auth.file_too_large") });
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
          <h1>{t("auth.digital_ward")}</h1>
          <p>{t("auth.streamlining")}</p>
          <div className="brand-features">
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>{t("auth.easy_registration")}</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>{t("auth.secure_data")}</span>
            </div>
            <div className="feature-item">
              <i className="fa-solid fa-check"></i>
              <span>{t("auth.quick_access")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Scrollable Form */}
      <div className="register-right-panel">
        <div className="register-container">
          <div className="register-header">
            <h1>{t("auth.create_account")}</h1>
            <p className="subtitle">{t("auth.join_today")}</p>
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
                    <span className="role-text">{t("auth.role_citizen")}</span>
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
                    <span className="role-text">{t("auth.role_officer")}</span>
                  </label>
                </div>
              </div>
            )}

            <div className="form-section">
              <h2 className="section-title">{t("auth.personal_details")}</h2>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.first_name")} *</label>
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
                      placeholder={t("auth.first_name")}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="error-message show">{errors.firstName}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("auth.last_name")} *</label>
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
                      placeholder={t("auth.last_name")}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="error-message show">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.middle_name")}</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-user-tag"></i>
                    <input
                      type="text"
                      name="middleName"
                      className="form-control"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder={t("auth.middle_name")}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("auth.profile_picture")}</label>
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
                          <span>{t("auth.click_to_upload")}</span>
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
                  <label>{t("auth.email")} *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "error" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.placeholder_email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="error-message show">{errors.email}</p>
                  )}
                </div>
                <div className="form-group">
                  <label>{t("auth.phone_number")} *</label>
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
                      placeholder={t("auth.placeholder_phone")}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="error-message show">{errors.contactNumber}</p>
                  )}
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.dob")} *</label>
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
                  <label>{t("auth.gender")} *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-venus-mars"></i>
                    <select
                      className={`form-control ${errors.gender ? "error" : ""}`}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="" disabled hidden>
                        {t("auth.select_gender")}
                      </option>
                      <option value="male">{t("auth.male")}</option>
                      <option value="female">{t("auth.female")}</option>
                      <option value="other">{t("auth.other")}</option>
                    </select>
                  </div>
                  {errors.gender && (
                    <p className="error-message show">{errors.gender}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2 className="section-title">{t("auth.address_location")}</h2>

              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.province")} *</label>
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
                      <option value="">{t("auth.select_province")}</option>
                      {getProvinces().map((p) => (
                        <option key={p.name} value={p.name}>
                          {language === "NP" ? p.name_np || p.name : p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.province && (
                    <p className="error-message show">{errors.province}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>{t("auth.district")} *</label>
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
                      <option value="">{t("auth.select_district")}</option>
                      {province &&
                        getDistricts(province).map((d) => (
                          <option key={d.name} value={d.name}>
                            {language === "NP" ? d.name_np || d.name : d.name}
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
                  <label>{t("auth.municipality")} *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-city"></i>
                    <select
                      className={`form-control ${errors.city ? "error" : ""}`}
                      name="municipality"
                      value={city}
                      onChange={handleMunicipalityChange}
                      disabled={!district}
                    >
                      <option value="">{t("auth.select_municipality")}</option>
                      {district &&
                        getMunicipalities(province, district).map((m) => (
                          <option key={m.name} value={m.name}>
                            {language === "NP" ? m.name_np || m.name : m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  {errors.city && (
                    <p className="error-message show">{errors.city}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>{t("auth.ward_no")} *</label>
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
                      <option value="">{t("auth.select_ward")}</option>
                      {availableWardNumbers.map((num) => (
                        <option key={num} value={num}>
                          {t("nav.ward")}{" "}
                          {language === "NP" ? toNepaliNumber(num) : num}
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
              <h2 className="section-title">
                {t("auth.identity_verification")}
              </h2>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.citizenship_number")} *</label>
                  <div className="input-wrapper">
                    <i className="fa-solid fa-id-card"></i>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.citizenshipNumber ? "error" : ""
                      }`}
                      value={citizenshipNumber}
                      onChange={(e) => setCitizenshipNumber(e.target.value)}
                      placeholder={t("auth.citizenship_number")}
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
                  <label>{t("auth.issue_date")} *</label>
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
                  <label>{t("auth.issue_district")} *</label>
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
                      <option value="">{t("auth.select_district")}</option>
                      {getProvinces()
                        .map((p) => getDistricts(p.name))
                        .flat()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((d) => (
                          <option key={d.name} value={d.name}>
                            {language === "NP" ? d.name_np || d.name : d.name}
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
                  <label>{t("auth.citizenship_photo")} *</label>
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
                          <span>{t("auth.click_to_upload")}</span>
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
                <h2 className="section-title">
                  {t("auth.officer_credentials")}
                </h2>
                <div className="form-row two-cols">
                  <div className="form-group">
                    <label>{t("auth.officer_id")} *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-hashtag"></i>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.officerId ? "error" : ""
                        }`}
                        value={officerId}
                        onChange={(e) => setOfficerId(e.target.value)}
                        placeholder={t("auth.officer_id_placeholder")}
                      />
                    </div>
                    {errors.officerId && (
                      <p className="error-message show">{errors.officerId}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>{t("auth.department")} *</label>
                    <div className="input-wrapper">
                      <i className="fa-solid fa-briefcase"></i>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.department ? "error" : ""
                        }`}
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder={t("auth.dept_placeholder")}
                      />
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
                          <option key={p.name} value={p.name}>
                            {language === "NP" ? p.name_np || p.name : p.name}
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
                            <option key={d.name} value={d.name}>
                              {language === "NP" ? d.name_np || d.name : d.name}
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
                                {language === "NP"
                                  ? m.name_np || m.name
                                  : m.name}
                              </option>
                            ),
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
              <h2 className="section-title">{t("auth.password")}</h2>
              <div className="form-row two-cols">
                <div className="form-group">
                  <label>{t("auth.password")} *</label>
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
                  <label>{t("auth.password")} *</label>
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
                <span>{t("auth.terms_conditions")}</span>
              </label>
              {errors.terms && (
                <p className="error-message show">{errors.terms}</p>
              )}
            </div>

            <button type="submit" className="btn-register" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.register_title")}
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
