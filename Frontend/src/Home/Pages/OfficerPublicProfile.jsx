import React, { useState } from "react";
import Navbar from "../Nav/Navbar";
import "./OfficerPublicProfile.css";

export default function OfficerPublicProfile() {
  const [activeTab, setActiveTab] = useState("details");

  const officerData = {
    name: "Ram Bahadur Shrestha",
    address: "Ward No. 1, Kathmandu",
    education: "Master's Degree (Political Science)",
    experience: "15 years in local politics",
    politicalParty: "Nepali Congress",
    appointmentDate: "2022/08/31",
    phone: "9841234567",
    email: "ram.shrestha@ktm.gov.np",
    ward: "Ward No. 1, Kathmandu",
  };

  const worksData = [
    {
      id: 1,
      title: "Road Construction - Main Street",
      budget: "Rs. 50,00,000",
      status: "Completed",
      startDate: "2024/01/15",
      endDate: "2024/06/30",
      beneficiaries: "500+ families",
    },
    {
      id: 2,
      title: "Community Health Center Renovation",
      budget: "Rs. 35,00,000",
      status: "Ongoing",
      startDate: "2024/07/01",
      endDate: "2025/02/28",
      beneficiaries: "2000+ citizens",
    },
    {
      id: 3,
      title: "Water Supply System Upgrade",
      budget: "Rs. 25,00,000",
      status: "Planned",
      startDate: "2025/03/01",
      endDate: "2025/08/31",
      beneficiaries: "300+ households",
    },
  ];

  const assetsData = [
    { type: "Land", description: "Residential plot in Kathmandu", value: "Rs. 1,50,00,000" },
    { type: "Vehicle", description: "Car (Honda Civic 2020)", value: "Rs. 35,00,000" },
    { type: "Savings", description: "Bank deposits", value: "Rs. 25,00,000" },
  ];

  const activitiesData = [
    { date: "2024/12/15", activity: "Community meeting on sanitation", attendees: "50+ residents" },
    { date: "2024/12/10", activity: "Inauguration of new park", attendees: "200+ citizens" },
    { date: "2024/12/05", activity: "Budget planning session", attendees: "Ward committee" },
    { date: "2024/11/28", activity: "School visit and donation drive", attendees: "100+ students" },
  ];

  const reviewsData = [
    { name: "Sita Sharma", rating: 5, comment: "Excellent work on road construction!", date: "2024/12/18" },
    { name: "Hari Prasad", rating: 4, comment: "Good communication with residents.", date: "2024/12/15" },
    { name: "Maya Gurung", rating: 5, comment: "Very responsive to community needs.", date: "2024/12/10" },
  ];

  // Dashboard stats
  const dashboardStats = {
    totalWorks: 15,
    completedWorks: 8,
    ongoingWorks: 5,
    plannedWorks: 2,
    totalBudget: "Rs. 2,50,00,000",
    averageRating: 4.7,
  };

  const tabs = [
    { id: "details", label: "Details", icon: "👤" },
    { id: "works", label: "Works", icon: "💼" },
    { id: "assets", label: "Assets", icon: "🏠" },
    { id: "activities", label: "Activities", icon: "📅" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "dashboard", label: "Dashboard", icon: "📊" },
  ];

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="officer-public-profile">
        <div className="officer-profile-container">
          {/* Tabs Navigation */}
          <div className="profile-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "details" && (
              <div className="details-section">
                <div className="info-grid">
                  {/* Personal Information */}
                  <div className="info-column">
                    <h3>Personal Information</h3>
                    <div className="info-items">
                      <div className="info-item">
                        <label>Address</label>
                        <p>{officerData.address}</p>
                      </div>
                      <div className="info-item">
                        <label>Education</label>
                        <p>{officerData.education}</p>
                      </div>
                      <div className="info-item">
                        <label>Experience</label>
                        <p>{officerData.experience}</p>
                      </div>
                      <div className="info-item">
                        <label>Political Party</label>
                        <p>{officerData.politicalParty}</p>
                      </div>
                      <div className="info-item">
                        <label>Appointment Date</label>
                        <p>{officerData.appointmentDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="info-column">
                    <h3>Contact Details</h3>
                    <div className="contact-items">
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <span>{officerData.phone}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">✉️</span>
                        <span>{officerData.email}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <span>{officerData.ward}</span>
                      </div>
                    </div>
                    <button className="download-btn">
                      <span className="download-icon">⬇️</span>
                      Download Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "works" && (
              <div className="works-section">
                <h3>Development Works</h3>
                <div className="works-grid">
                  {worksData.map((work) => (
                    <div key={work.id} className="work-card">
                      <div className="work-header">
                        <h4>{work.title}</h4>
                        <span className={`status-badge ${work.status.toLowerCase()}`}>
                          {work.status}
                        </span>
                      </div>
                      <div className="work-details">
                        <div className="work-detail-item">
                          <span className="label">💰 Budget:</span>
                          <span className="value">{work.budget}</span>
                        </div>
                        <div className="work-detail-item">
                          <span className="label">📅 Duration:</span>
                          <span className="value">{work.startDate} - {work.endDate}</span>
                        </div>
                        <div className="work-detail-item">
                          <span className="label">👥 Beneficiaries:</span>
                          <span className="value">{work.beneficiaries}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "assets" && (
              <div className="assets-section">
                <h3>Asset Declaration</h3>
                <div className="assets-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Asset Type</th>
                        <th>Description</th>
                        <th>Estimated Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assetsData.map((asset, index) => (
                        <tr key={index}>
                          <td><strong>{asset.type}</strong></td>
                          <td>{asset.description}</td>
                          <td className="value-col">{asset.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="total-assets">
                    <span>Total Declared Assets:</span>
                    <strong>Rs. 2,10,00,000</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div className="activities-section">
                <h3>Recent Activities & Events</h3>
                <div className="timeline">
                  {activitiesData.map((activity, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">{activity.date}</div>
                      <div className="timeline-content">
                        <h4>{activity.activity}</h4>
                        <p>👥 {activity.attendees}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="reviews-section">
                <h3>Public Reviews & Ratings</h3>
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-number">4.7</span>
                    <div className="stars">⭐⭐⭐⭐⭐</div>
                    <p>Based on {reviewsData.length} reviews</p>
                  </div>
                </div>
                <div className="reviews-list">
                  {reviewsData.map((review, index) => (
                    <div key={index} className="review-card">
                      <div className="review-header">
                        <strong>{review.name}</strong>
                        <span className="review-date">{review.date}</span>
                      </div>
                      <div className="review-rating">
                        {"⭐".repeat(review.rating)}
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "dashboard" && (
              <div className="dashboard-section">
                <h3>Performance Dashboard</h3>
                <div className="dashboard-grid">
                  <div className="dash-card">
                    <div className="dash-icon">🏗️</div>
                    <div className="dash-info">
                      <span className="dash-label">Total Works</span>
                      <span className="dash-value">{dashboardStats.totalWorks}</span>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-icon">✅</div>
                    <div className="dash-info">
                      <span className="dash-label">Completed</span>
                      <span className="dash-value">{dashboardStats.completedWorks}</span>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-icon">🔄</div>
                    <div className="dash-info">
                      <span className="dash-label">Ongoing</span>
                      <span className="dash-value">{dashboardStats.ongoingWorks}</span>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-icon">📋</div>
                    <div className="dash-info">
                      <span className="dash-label">Planned</span>
                      <span className="dash-value">{dashboardStats.plannedWorks}</span>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-icon">💰</div>
                    <div className="dash-info">
                      <span className="dash-label">Total Budget</span>
                      <span className="dash-value">{dashboardStats.totalBudget}</span>
                    </div>
                  </div>
                  <div className="dash-card">
                    <div className="dash-icon">⭐</div>
                    <div className="dash-info">
                      <span className="dash-label">Avg Rating</span>
                      <span className="dash-value">{dashboardStats.averageRating}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
