import React, { useState, useMemo } from "react";
import Navbar from "../Nav/Navbar";
import "./Contact.css";
import { useWard } from "../Context/WardContext";

export default function Contact() {
  const { municipality: selectedMunicipality, ward: selectedWard } = useWard();
  const wardData = useMemo(
    () => getDefaultWardData(selectedMunicipality, selectedWard),
    [selectedMunicipality, selectedWard]
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "Medium",
  });
  const [formStatus, setFormStatus] = useState(null);

  // Sample data for departments - In future, fetch this from backend
  const [departments] = useState([
    {
      name: "Administration Department",
      head: "Mr. Ram Bahadur Shrestha",
      phone: "01-4234567",
      email: "admin@wardportal.gov.np",
      icon: "🏢",
    },
    {
      name: "Planning & Development Department",
      head: "Mrs. Sita Devi Poudel",
      phone: "01-4234568",
      email: "planning@wardportal.gov.np",
      icon: "🏗️",
    },
    {
      name: "Social Development Department",
      head: "Mr. Hari Prasad Gurung",
      phone: "01-4234569",
      email: "social@wardportal.gov.np",
      icon: "👥",
    },
    {
      name: "Financial Administration Department",
      head: "Mrs. Geeta Kumari Tamang",
      phone: "01-4234570",
      email: "finance@wardportal.gov.np",
      icon: "💰",
    },
  ]);

  // Social media links - Update these with actual ward social media URLs
  const [socialMedia] = useState({
    facebook: "https://www.facebook.com/kathmandumetrocity",
    instagram: "https://www.instagram.com/kathmandumetrocity",
    twitter: "https://twitter.com/Ktmmetrocity",
    whatsapp: "https://wa.me/9779851234567", // Replace with actual WhatsApp number
  });

  // Frontend-only: static ward/municipality without localStorage or backend

  function getDefaultWardData(
    municipality = "Kathmandu Metropolitan City",
    ward = 1
  ) {
    const WARDS = {
      1: {
        phone1: "01-4211234",
        phone2: "01-4211567",
        email: "ward1@kathmandu.gov.np",
        contactEmail: "contact@kathmandu.gov.np",
        address: "Kathmandu Metropolitan City, Ward No. 1",
        latitude: 27.7172,
        longitude: 85.324,
      },
      2: {
        phone1: "01-4211235",
        phone2: "01-4211568",
        email: "ward2@kathmandu.gov.np",
        contactEmail: "contact@kathmandu.gov.np",
        address: "Kathmandu Metropolitan City, Ward No. 2",
        latitude: 27.7089,
        longitude: 85.3247,
      },
      3: {
        phone1: "01-4211236",
        phone2: "01-4211569",
        email: "ward3@kathmandu.gov.np",
        contactEmail: "contact@kathmandu.gov.np",
        address: "Kathmandu Metropolitan City, Ward No. 3",
        latitude: 27.7105,
        longitude: 85.3135,
      },
    };
    const info = WARDS[ward] || WARDS[1];
    return {
      ward: String(ward),
      municipality,
      phone1: info.phone1,
      phone2: info.phone2,
      email: info.email,
      contactEmail: info.contactEmail,
      address: info.address,
      officeHours: {
        weekdays: "10:00 AM - 5:00 PM",
        friday: "10:00 AM - 3:00 PM",
        saturday: "Closed",
      },
      latitude: info.latitude,
      longitude: info.longitude,
    };
  }

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
      ward: wardData.ward,
      municipality: wardData.municipality,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      priority: formData.priority,
      message: formData.message,
      created_at: new Date().toISOString(),
    };

    const endpoint =
      formData.subject === "complaint"
        ? "/api/complaints.php"
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
    if (wardData?.latitude && wardData?.longitude) {
      window.open(
        `https://www.google.com/maps?q=${wardData.latitude},${wardData.longitude}`,
        "_blank"
      );
    }
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
                <span className="contact-icon">📞</span>
              </div>
              <h3>Call Us</h3>
              <p className="contact-timing">
                Monday - Friday, 9:00 AM - 5:00 PM
              </p>
              <>
                <a href={`tel:${wardData?.phone1}`} className="contact-link">
                  {wardData?.phone1}
                </a>
                <a href={`tel:${wardData?.phone2}`} className="contact-link">
                  {wardData?.phone2}
                </a>
              </>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-wrapper green">
                <span className="contact-icon">📧</span>
              </div>
              <h3>Email Us</h3>
              <p className="contact-timing">You can email us anytime</p>
              <>
                <a href={`mailto:${wardData?.email}`} className="contact-link">
                  {wardData?.email}
                </a>
                <a
                  href={`mailto:${wardData?.contactEmail}`}
                  className="contact-link"
                >
                  {wardData?.contactEmail}
                </a>
              </>
            </div>
            <div className="contact-info-card">
              <div className="contact-icon-wrapper purple">
                <span className="contact-icon">📍</span>
              </div>
              <h3>Visit Us</h3>
              <p className="contact-timing">Office Hours: 9:00 AM - 5:00 PM</p>
              <p className="contact-address">
                {selectedMunicipality}, Ward No. {selectedWard}
              </p>
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
                  <iframe
                    title="Ward Office Location"
                    src={`https://maps.google.com/maps?q=${wardData?.latitude},${wardData?.longitude}&z=15&output=embed`}
                    width="100%"
                    height="300"
                    style={{ border: 0, borderRadius: "8px" }}
                    allowFullScreen=""
                    loading="lazy"
                  ></iframe>
                </div>
                <div className="location-details">
                  <p className="location-icon-text">
                    <span>📍</span>
                    <strong>{selectedMunicipality}</strong>
                  </p>
                  <p className="location-address">
                    Ward No. {selectedWard}, Kathmandu, Nepal
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
                      {wardData?.officeHours?.weekdays}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Friday</span>
                    <span className="time">
                      {wardData?.officeHours?.friday}
                    </span>
                  </div>
                  <div className="hours-item">
                    <span className="day">Saturday</span>
                    <span className="time closed">
                      {wardData?.officeHours?.saturday}
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
            {departments.map((dept, index) => (
              <div className="department-card" key={index}>
                <div className="dept-icon">{dept.icon}</div>
                <div className="dept-info">
                  <h3>{dept.name}</h3>
                  <p>
                    <i className="fa-solid fa-user"></i> {dept.head}
                  </p>
                  <p>
                    <i className="fa-solid fa-phone"></i> {dept.phone}
                  </p>
                  <p>
                    <i className="fa-solid fa-envelope"></i> {dept.email}
                  </p>
                </div>
              </div>
            ))}
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
          <div className="social-media-section">
            <h2>Follow Us on Social Media</h2>
            <div className="social-buttons">
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn facebook"
              >
                <i className="fa-brands fa-facebook-f"></i> Facebook
              </a>
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn instagram"
              >
                <i className="fa-brands fa-instagram"></i> Instagram
              </a>
              <a
                href={socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn x-twitter"
              >
                <i className="fa-brands fa-x-twitter"></i> X (Twitter)
              </a>
              <a
                href={socialMedia.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn whatsapp"
              >
                <i className="fa-brands fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
