import React, { useState, useEffect } from "react";
import Navbar from "../Nav/Navbar";
import { useWard } from "../Context/WardContext";
import "./Works.css";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

const WorkCard = ({ work }) => {
  return (
    <div className="work-card">
      <div className="work-header">
        <div>
          <div className="work-label">WORKS</div>
          <h3 className="work-title">{work.title}</h3>
          <p className="work-location">
            {work.ward}, {work.municipality}
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

      <div className="work-stats-grid">
        <div className="stat-item">
          <label>Start Date</label>
          <div>{work.start_date || work.startDate || "N/A"}</div>
        </div>
        <div className="stat-item">
          <label>End Date</label>
          <div>{work.end_date || work.endDate || "N/A"}</div>
        </div>
        <div className="stat-item">
          <label>Budget</label>
          <div>
            {work.budget.startsWith("Rs.") ? work.budget : `Rs. ${work.budget}`}
          </div>
        </div>
        <div className="stat-item">
          <label>Beneficiaries</label>
          <div>{work.beneficiaries}</div>
        </div>
      </div>

      <div className="work-description">
        <p>{work.description}</p>
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
