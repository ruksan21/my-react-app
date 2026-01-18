import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import "./Contact.css";
import { useWard } from "../Context/WardContext";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";
import { useLanguage } from "../Context/useLanguage";

export default function Contact() {
  const { t } = useLanguage();
  const {
    municipality: selectedMunicipality,
    ward: selectedWard,
    wardId,
  } = useWard();
  const { user } = useAuth();
  const [wardInfo, setWardInfo] = useState({
    phone1: "---",
    phone2: "---",
    email: "---",
    contactEmail: "---",
    address: selectedMunicipality + ", Ward No. " + selectedWard,
    location: t("common.loading"),
    district: "",
    latitude: null,
    longitude: null,
    google_map_link: "",
    officeHours: {
      weekdays: "10:00 AM - 5:00 PM",
      friday: "10:00 AM - 3:00 PM",
      saturday: "Closed",
    },
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
  });

  // Fetch Ward Details and Departments
  useEffect(() => {
    if (!wardId) {
      console.log("Contact: No wardId found");
      return;
    }

    console.log("Contact: Fetching ward details for ID:", wardId);
    setLoading(true);
    // Fetch Ward Details
    fetch(`${API_ENDPOINTS.wards.getDetails}?id=${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Contact: Ward details response:", data);
        if (data.success && data.data) {
          const w = data.data;
          setWardInfo({
            phone1: w.contact_phone || "---",
            phone2: w.telephone || "---",
            email: w.contact_email || "---",
            contactEmail: w.chairperson_email || "---",
            address:
              w.location || `${w.municipality}, Ward No. ${w.ward_number}`,
            location: w.location || w.municipality,
            district: w.district_name || "",
            latitude: w.latitude || null,
            longitude: w.longitude || null,
            google_map_link: w.google_map_link || "",
            officeHours: {
              weekdays: w.office_hours_weekdays || "10:00 AM - 5:00 PM",
              friday: w.office_hours_friday || "10:00 AM - 3:00 PM",
              saturday: w.office_hours_saturday || "Closed",
            },
          });

          // Fetch social media links for this ward
          const params = new URLSearchParams({
            province: w.province,
            municipality: w.municipality,
            ward: w.ward_number,
          });
          // Only add district if it exists
          if (w.district) {
            params.append("district", w.district);
          }
          console.log(
            "Contact: Fetching social media with params:",
            params.toString(),
          );
          fetch(`${API_ENDPOINTS.socialMedia.get}?${params}`)
            .then((res) => res.json())
            .then((socialData) => {
              console.log("Contact: Social media response:", socialData);
              if (socialData.success && socialData.data) {
                setSocialMedia({
                  facebook: socialData.data.facebook || "",
                  instagram: socialData.data.instagram || "",
                  twitter: socialData.data.twitter || "",
                  whatsapp: socialData.data.whatsapp || "",
                });
                console.log(
                  "Contact: Social media state updated:",
                  socialData.data,
                );
              }
            })
            .catch((err) => console.error("Error fetching social media:", err));
        }
      })
      .catch((err) => console.error("Error fetching ward details:", err));

    // Fetch Departments
    fetch(`${API_ENDPOINTS.alerts.manageDepartments}?ward_id=${wardId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDepartments(data.data);
        }
      })
      .catch((err) => console.error("Error fetching departments:", err))
      .finally(() => setLoading(false));
  }, [wardId]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "Medium",
    file: null, // Add file state
  });
  const [formStatus, setFormStatus] = useState(null);

  function handleInputChange(e) {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    setFormStatus({
      type: "loading",
      message: t("contact.form.sending"),
    });

    (async () => {
      try {
        // Use FormData for file upload
        const payload = new FormData();
        payload.append("ward_id", wardId);
        payload.append("ward", selectedWard);
        payload.append("municipality", selectedMunicipality);
        payload.append("fullName", formData.fullName);
        payload.append("email", formData.email);
        payload.append("phone", formData.phone);
        payload.append("subject", formData.subject);
        payload.append("priority", formData.priority);
        payload.append("message", formData.message);
        if (user?.id) {
          payload.append("userId", user.id);
        }
        if (formData.file) {
          payload.append("image", formData.file);
        }

        const endpoint = API_ENDPOINTS.communication.submitComplaint;

        const res = await fetch(endpoint, {
          method: "POST",
          body: payload,
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Server responded ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        if (!data.success) {
          // Check if it's because no officer exists
          if (data.no_officer) {
            setFormStatus({
              type: "error",
              message:
                data.message ||
                "No officer is currently assigned to this ward. Please contact the municipality office directly.",
            });
          } else {
            throw new Error(data.message || "Submission failed");
          }
          setTimeout(() => setFormStatus(null), 5000);
          return;
        }

        setFormStatus({
          type: "success",
          message: data.message || "Message sent successfully!",
        });

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          priority: "Medium",
          file: null,
        });

        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";

        setTimeout(() => setFormStatus(null), 4000);
      } catch (err) {
        console.error("Contact form error:", err);
        setFormStatus({
          type: "error",
          message: err.message || "Error occurred. Please try again.",
        });
        setTimeout(() => setFormStatus(null), 5000);
      }
    })();
  }

  function openLocation() {
    // Priority 1: Use direct map link if it's not an iframe
    if (
      wardInfo?.google_map_link &&
      !wardInfo.google_map_link.includes("<iframe")
    ) {
      window.open(wardInfo.google_map_link, "_blank");
      return;
    }

    // Priority 2: Use specific coordinates if available
    if (wardInfo?.latitude && wardInfo?.longitude) {
      window.open(
        `https://www.google.com/maps?q=${wardInfo.latitude},${wardInfo.longitude}`,
        "_blank",
      );
      return;
    }

    // Priority 3: Fallback - Search by Address
    const query = encodeURIComponent(
      `${wardInfo.address}, ${wardInfo.district}, Nepal`,
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
    );
  }

  if (loading && !wardInfo.location) {
    return <div className="loading-container">{t("common.loading")}</div>;
  }

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="contact-page">
        <div className="contact-hero">
          <div className="contact-hero-overlay">
            <h1>{t("contact.title")}</h1>
            <p>{t("contact.subtitle")}</p>
          </div>
        </div>
        <div className="contact-container">
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="contact-icon-wrapper blue">
                <i className="fa-solid fa-phone contact-icon"></i>
              </div>
              <h3>{t("contact.call_us")}</h3>
              <p className="contact-timing">{t("contact.timing_weekdays")}</p>
              <>
                <a href={`tel:${wardInfo?.phone1}`} className="contact-link">
                  {wardInfo?.phone1}
                </a>
                <a href={`tel:${wardInfo?.phone2}`} className="contact-link">
                  {wardInfo?.phone2}
                </a>
              </>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-wrapper green">
                <i className="fa-solid fa-envelope contact-icon"></i>
              </div>
              <h3>{t("contact.email_us")}</h3>
              <p className="contact-timing">{t("contact.timing_anytime")}</p>
              <>
                <a href={`mailto:${wardInfo?.email}`} className="contact-link">
                  {wardInfo?.email}
                </a>
                <a
                  href={`mailto:${wardInfo?.contactEmail}`}
                  className="contact-link"
                >
                  {wardInfo?.contactEmail}
                </a>
              </>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-wrapper purple">
                <i className="fa-solid fa-location-dot contact-icon"></i>
              </div>
              <h3>{t("contact.visit_us")}</h3>
              <p className="contact-timing">
                {t("contact.office_hours_label")}
              </p>
              <p className="contact-address">{wardInfo.address}</p>
            </div>
          </div>

          <div className="contact-content-grid">
            <div className="contact-form-section">
              <h2>{t("contact.send_message")}</h2>

              <div className="message-recipient-info">
                <div className="recipient-badge">
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>
                    {t("contact.recipient")}:{" "}
                    <strong>
                      {t("about.roles.officer")} {selectedMunicipality},{" "}
                      {t("auth.ward_no")} {selectedWard}
                    </strong>
                  </span>
                </div>
                <p className="recipient-note">{t("contact.recipient_note")}</p>
              </div>

              {formStatus && (
                <div className={`form-alert ${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t("contact.form.full_name")} *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.full_name")}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("contact.form.email")} *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.email")}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t("contact.form.phone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder={t("contact.form.phone")}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t("contact.form.subject")} *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">
                        {t("contact.form.select_subject")}
                      </option>
                      <option value="general">
                        {t("contact.form.subjects.general")}
                      </option>
                      <option value="complaint">
                        {t("contact.form.subjects.complaint")}
                      </option>
                      <option value="suggestion">
                        {t("contact.form.subjects.suggestion")}
                      </option>
                      <option value="feedback">
                        {t("contact.form.subjects.feedback")}
                      </option>
                      <option value="service">
                        {t("contact.form.subjects.service")}
                      </option>
                      <option value="other">
                        {t("contact.form.subjects.other")}
                      </option>
                    </select>

                    {/* Priority appears only when submitting a complaint */}
                    {formData.subject === "complaint" && (
                      <div style={{ marginTop: 12 }}>
                        <label>{t("contact.form.priority")}</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          <option value="High">
                            {t("contact.form.priorities.high")}
                          </option>
                          <option value="Medium">
                            {t("contact.form.priorities.medium")}
                          </option>
                          <option value="Low">
                            {t("contact.form.priorities.low")}
                          </option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("contact.form.message")} *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t("contact.form.message")}
                    rows="5"
                    maxLength="500"
                    required
                  ></textarea>
                  <div className="char-count">
                    {formData.message.length}/500
                  </div>
                </div>

                {/* File Upload with better design */}
                <div className="form-group">
                  <label>
                    📎 {t("contact.form.attach_image")}
                    <small
                      style={{
                        marginLeft: "8px",
                        color: "#667085",
                        fontWeight: "normal",
                      }}
                    >
                      {t("contact.form.file_hint")}
                    </small>
                  </label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      name="file"
                      id="fileInput"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleInputChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="fileInput" className="file-input-label">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      {formData.file ? (
                        <span className="file-selected">
                          ✓ {formData.file.name}
                        </span>
                      ) : (
                        <span>{t("contact.form.click_upload")}</span>
                      )}
                    </label>
                    {formData.file && (
                      <button
                        type="button"
                        className="file-remove-btn"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, file: null }));
                          document.getElementById("fileInput").value = "";
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={formStatus?.type === "loading"}
                >
                  {formStatus?.type === "loading" ? (
                    <>
                      <span className="spinner"></span>{" "}
                      {t("contact.form.sending")}
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>{" "}
                      {t("contact.form.send_btn")}
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="location-section">
              <div className="location-card">
                <h2>{t("contact.location_title")}</h2>
                <div className="map-container">
                  {wardInfo.google_map_link &&
                  wardInfo.google_map_link.includes("iframe") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: wardInfo.google_map_link,
                      }}
                    />
                  ) : (
                    <iframe
                      title="Ward Office Location"
                      src={`https://maps.google.com/maps?q=${wardInfo.location}&z=15&output=embed`}
                      width="100%"
                      height="400"
                      style={{ border: 0, borderRadius: "12px" }}
                      allowFullScreen=""
                      loading="lazy"
                    ></iframe>
                  )}
                </div>
                <div className="location-details">
                  <p className="location-icon-text">
                    <span>📍</span>
                    <strong>{selectedMunicipality}</strong>
                  </p>
                  <p className="location-address">
                    {t("auth.ward_no")} {selectedWard}, {wardInfo.district},
                    Nepal
                  </p>
                  <button className="open-map-btn" onClick={openLocation}>
                    🗺️ {t("contact.open_maps")}
                  </button>
                </div>
              </div>
              <div className="office-hours-card">
                <h2>{t("contact.office_hours_title")}</h2>
                <div className="hours-list">
                  <div className="hours-item">
                    <span className="day">
                      {t("contact.days.sunday_thursday")}
                    </span>
                    <span className="time">
                      {wardInfo?.officeHours?.weekdays}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">{t("contact.days.friday")}</span>
                    <span className="time">
                      {wardInfo?.officeHours?.friday}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">{t("contact.days.saturday")}</span>
                    <span className="time closed">
                      {wardInfo?.officeHours?.saturday}
                    </span>
                  </div>
                </div>
                <div className="office-note">
                  <span>ℹ️</span>
                  <p>{t("contact.office_note")}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Department Contacts Section */}
          <div className="section-header">
            <h2>{t("contact.dept_contacts")}</h2>
          </div>
          <div className="department-grid">
            {/* 
              BACKEND INTEGRATION:
              Fetch these departments from the 'departments' table in your database.
              Endpoint: GET /api/departments.php?ward_id=...
            */}
            {departments.length === 0 ? (
              <p
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "#888",
                }}
              >
                {t("contact.no_depts")}
              </p>
            ) : (
              departments.map((dept, index) => (
                <div className="department-card" key={index}>
                  <div className="dept-icon">{dept.icon}</div>
                  <div className="dept-info">
                    <h3>{dept.name}</h3>
                    <p>
                      <i className="fa-solid fa-user"></i> {dept.head_name}
                    </p>
                    <p>
                      <i className="fa-solid fa-phone"></i> {dept.phone}
                    </p>
                    <p>
                      <i className="fa-solid fa-envelope"></i> {dept.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FAQ Section */}
          <div className="section-header" style={{ marginTop: "60px" }}>
            <h2>{t("contact.faq_title")}</h2>
          </div>
          <div className="faq-section">
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>{t("contact.faqs.meeting.q")}</h3>
                <p>{t("contact.faqs.meeting.a")}</p>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>{t("contact.faqs.recommendation.q")}</h3>
                <p>{t("contact.faqs.recommendation.a")}</p>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>{t("contact.faqs.complaint.q")}</h3>
                <p>{t("contact.faqs.complaint.a")}</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          {(socialMedia.facebook ||
            socialMedia.instagram ||
            socialMedia.twitter ||
            socialMedia.whatsapp) && (
            <div className="social-media-section">
              <h2>{t("contact.social_title")}</h2>
              <div className="social-buttons">
                {socialMedia.facebook && (
                  <a
                    href={socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn facebook"
                  >
                    <i className="fa-brands fa-facebook-f"></i> Facebook
                  </a>
                )}
                {socialMedia.instagram && (
                  <a
                    href={socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn instagram"
                  >
                    <i className="fa-brands fa-instagram"></i> Instagram
                  </a>
                )}
                {socialMedia.twitter && (
                  <a
                    href={socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn x-twitter"
                  >
                    <i className="fa-brands fa-x-twitter"></i> X (Twitter)
                  </a>
                )}
                {socialMedia.whatsapp && (
                  <a
                    href={socialMedia.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-btn whatsapp"
                  >
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
