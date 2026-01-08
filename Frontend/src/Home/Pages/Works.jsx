import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import { useWard } from "../Context/WardContext";
import "./Works.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

const WorkCard = ({ work }) => {
  // Format budget to ensure it's displayed properly
  const formatBudget = (budget) => {
    if (!budget) return "N/A";
    const budgetStr = String(budget);
    if (budgetStr.startsWith("Rs.")) return budgetStr;
    // Add commas for readability
    const num = parseFloat(budgetStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return budgetStr;
    return `Rs. ${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="work-card">
      <div className="work-header">
        <div>
          <div className="work-label">DEVELOPMENT WORK</div>
          <h3 className="work-title">{work.title}</h3>
          <p className="work-location">
            📍 {work.ward}, {work.municipality}
          </p>
        </div>
        <span className={`work-status status-${work.status.toLowerCase()}`}>
          {work.status}
        </span>
      </div>

      <div className="work-image-container">
        <img
          src={
            work.image
              ? `${API_BASE_URL}/${work.image}`
              : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"
          }
          alt={work.title}
          className="work-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80"; // Fallback
          }}
        />
      </div>

      {/* Budget Highlight Section */}
      <div className="work-budget-highlight">
        <div className="budget-icon">💰</div>
        <div className="budget-details">
          <div className="budget-label">Project Budget</div>
          <div className="budget-amount">{formatBudget(work.budget)}</div>
        </div>
      </div>

      <div className="work-stats-grid">
        <div className="stat-item">
          <label>📅 Start Date</label>
          <div>{work.start_date || work.startDate || "Not specified"}</div>
        </div>
        <div className="stat-item">
          <label>📅 End Date</label>
          <div>{work.end_date || work.endDate || "Not specified"}</div>
        </div>
        <div className="stat-item">
          <label>👥 Beneficiaries</label>
          <div>{work.beneficiaries || "N/A"}</div>
        </div>
        <div className="stat-item">
          <label>📊 Status</label>
          <div className="status-text">{work.status}</div>
        </div>
      </div>

      <div className="work-description">
        <h4 className="description-title">Project Details</h4>
        <p>{work.description}</p>
      </div>

      {/* Notice Section */}
      <div className="work-notice-section">
        <div className="notice-icon">📢</div>
        <div className="notice-text">
          For official notices and updates related to this project, check the Ward Notices section.
        </div>
      </div>
    </div>
  );
};

export default function Works({ embedded = false, wardId }) {
  const { municipality, ward } = useWard();
  const [works, setWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    let url = API_ENDPOINTS.works.getAll;

    // Construct query parameters
    const params = new URLSearchParams();

    if (wardId) {
      // If specific ward ID provided (e.g. Profile page), use strict ID filter
      params.append("ward_id", wardId);
    } else {
      // Otherwise use Global Context filters
      if (ward) params.append("ward_number", ward);
      if (municipality) params.append("municipality", municipality);
    }

    const queryString = params.toString();
    if (queryString) {
      url += "?" + queryString;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setWorks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching works:", err);
        setWorks([]); // Ensure works is array on error
        setIsLoading(false);
      });
  }, [ward, municipality, wardId]); // Re-fetch when dependencies change

  return (
    <>
      {!embedded && <Navbar showHomeContent={false} />}
      <div className={`works-page ${embedded ? "embedded" : ""}`}>
        {embedded && (
          <div className="embedded-header" style={{ marginBottom: 12 }}>
            <span className="embedded-pin">📍</span>
            <span className="embedded-title">
              {municipality} - Ward {ward}
            </span>
          </div>
        )}

        {!embedded && (
          <div className="section-header">
            <span className="section-pin">🏗️</span>
            <span className="section-title">Development Works</span>
          </div>
        )}

        <div className="works-list">
          {isLoading ? (
            <div className="loading-state">Loading works...</div>
          ) : works.length === 0 ? (
            <div className="empty-state">
              No development works found for this ward.
            </div>
          ) : (
            works.map((work) => <WorkCard key={work.id} work={work} />)
          )}
        </div>
        <div className="works-note">
          These work details are officially created and managed by Ward
          Officers.
        </div>
      </div>
    </>
  );
}
