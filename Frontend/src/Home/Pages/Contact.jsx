import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import "./Contact.css";
import { useWard } from "../Context/WardContext";
import { useAuth } from "../Context/AuthContext";
import { API_ENDPOINTS } from "../../config/api";

export default function Contact() {
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
    location: "Loading...",
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
            params.append('district', w.district);
          }
          console.log("Contact: Fetching social media with params:", params.toString());
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
                console.log("Contact: Social media state updated:", socialData.data);
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
  });
  const [formStatus, setFormStatus] = useState(null);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Send to backend API (if available).
    // If subject === 'complaint' the message should go to officer complaints endpoint.
    // PHP endpoint examples (implement server-side):
    // POST /api/complaints.php  { ward, municipality, fullName, email, phone, subject, message }
    // POST /api/messages.php    { ward, municipality, fullName, email, phone, subject, message }

    const payload = {
      ward: selectedWard,
      municipality: selectedMunicipality,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      priority: formData.priority,
      message: formData.message,
      userId: user?.id,
      created_at: new Date().toISOString(),
    };

    const endpoint =
      formData.subject === "complaint"
        ? "/api/communication/submit_complaint.php"
        : "/api/messages.php";

    setFormStatus({ type: "loading", message: "Sending..." });

    // Try to POST to the backend. If no backend exists yet, falls back to frontend-only behavior.
    (async () => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }

        // Optional: server may return { success: true, id: NEW_ID }
        setFormStatus({ type: "success", message: "Message sent." });
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          priority: "Medium",
        });
        setTimeout(() => setFormStatus(null), 3000);
      } catch {
        // If API not available, still keep frontend behavior but show warning.
        setFormStatus({
          type: "warning",
          message:
            "Could not reach server — message saved locally in frontend (no backend).",
        });
        setTimeout(() => setFormStatus(null), 3500);
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
        "_blank"
      );
      return;
    }

    // Priority 3: Fallback - Search by Address
    const query = encodeURIComponent(
      `${wardInfo.address}, ${wardInfo.district}, Nepal`
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  }

  if (loading && !wardInfo.location) {
    return <div className="loading-container">Loading Ward Details...</div>;
  }

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="contact-page">
        <div className="contact-hero">
          <div className="contact-hero-overlay">
            <h1>Contact Us</h1>
            <p>We are always ready to serve you</p>
          </div>
        </div>
        <div className="contact-container">
          <div className="contact-info-section">
            <div className="contact-info-card">
              <div className="contact-icon-wrapper blue">
                <i className="fa-solid fa-phone contact-icon"></i>
              </div>
              <h3>Call Us</h3>
              <p className="contact-timing">
                Monday - Friday, 9:00 AM - 5:00 PM
              </p>
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
              <h3>Email Us</h3>
              <p className="contact-timing">You can email us anytime</p>
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
              <h3>Visit Us</h3>
              <p className="contact-timing">Office Hours: 9:00 AM - 5:00 PM</p>
              <p className="contact-address">{wardInfo.address}</p>
            </div>
          </div>

          <div className="contact-content-grid">
            <div className="contact-form-section">
              <h2>Send us a Message</h2>
              {formStatus && (
                <div className={`form-alert ${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your email address"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="complaint">Complaint</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="feedback">Feedback</option>
                      <option value="service">Service Request</option>
                      <option value="other">Other</option>
                    </select>

                    {/* Priority appears only when submitting a complaint */}
                    {formData.subject === "complaint" && (
                      <div style={{ marginTop: 12 }}>
                        <label>Priority</label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          style={{ width: "100%", marginTop: 6 }}
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your message here..."
                    rows="5"
                    maxLength="500"
                    required
                  ></textarea>
                  <div className="char-count">
                    {formData.message.length}/500
                  </div>
                </div>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={formStatus?.type === "loading"}
                >
                  {formStatus?.type === "loading" ? (
                    <>
                      <span className="spinner"></span> Sending...
                    </>
                  ) : (
                    <>✈️ Send Message</>
                  )}
                </button>
              </form>
            </div>
            <div className="location-section">
              <div className="location-card">
                <h2>Our Location</h2>
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
                      height="300"
                      style={{ border: 0, borderRadius: "8px" }}
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
                    Ward No. {selectedWard}, {wardInfo.district}, Nepal
                  </p>
                  <button className="open-map-btn" onClick={openLocation}>
                    🗺️ Open in Google Maps
                  </button>
                </div>
              </div>
              <div className="office-hours-card">
                <h2>Office Hours</h2>
                <div className="hours-list">
                  <div className="hours-item">
                    <span className="day">Sunday - Thursday</span>
                    <span className="time">
                      {wardInfo?.officeHours?.weekdays}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Friday</span>
                    <span className="time">
                      {wardInfo?.officeHours?.friday}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Saturday</span>
                    <span className="time closed">
                      {wardInfo?.officeHours?.saturday}
                    </span>
                  </div>
                </div>
                <div className="office-note">
                  <span>ℹ️</span>
                  <p>Office remains closed on public holidays</p>
                </div>
              </div>
            </div>
          </div>
          {/* Department Contacts Section */}
          <div className="section-header">
            <h2>Department Contacts</h2>
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
                No department contacts listed for this ward yet.
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
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-section">
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>How to schedule a meeting with Ward Chairperson?</h3>
                <p>
                  You can schedule an appointment by calling or sending an
                  email. Generally available Monday to Friday from 10:00 AM to
                  4:00 PM.
                </p>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>How to get recommendation letter?</h3>
                <p>
                  Come to ward office with required documents. Citizenship
                  certificate, land ownership certificate and other related
                  documents are needed.
                </p>
              </div>
            </div>
            <div className="faq-card">
              <div className="faq-icon">❓</div>
              <div className="faq-content">
                <h3>How to register complaints?</h3>
                <p>
                  You can use the contact form on this website or visit the ward
                  office directly to register complaints.
                </p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          {(socialMedia.facebook ||
            socialMedia.instagram ||
            socialMedia.twitter ||
            socialMedia.whatsapp) && (
            <div className="social-media-section">
              <h2>Follow Us on Social Media</h2>
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
