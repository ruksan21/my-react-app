import React, { useState } from "react";
import Navbar from "../Nav/Navbar";
import "./Departments.css";

export default function Departments() {
  const [departments] = useState([
    {
      id: 1,
      name: "Administration Department",
      headName: "Mr. Ram Bahadur Shrestha",
      phone: "01-4234567",
      email: "admin@wardportal.gov.np",
      icon: "🏢",
    },
    {
      id: 2,
      name: "Planning & Development Department",
      headName: "Mrs. Sita Devi Poudel",
      phone: "01-4234568",
      email: "planning@wardportal.gov.np",
      icon: "🏗️",
    },
    {
      id: 3,
      name: "Social Development Department",
      headName: "Mr. Hari Prasad Gurung",
      phone: "01-4234569",
      email: "social@wardportal.gov.np",
      icon: "👥",
    },
    {
      id: 4,
      name: "Financial Administration Department",
      headName: "Mrs. Geeta Kumari Tamang",
      phone: "01-4234570",
      email: "finance@wardportal.gov.np",
      icon: "💰",
    },
  ]);

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="departments-page">
        <div className="departments-header">
          <h1>Department Contacts</h1>
        </div>

        <div className="departments-container">
          <div className="departments-public-grid">
            {departments.map((dept) => (
              <div className="dept-public-card" key={dept.id}>
                <div className="dept-card-content">
                  <div className="dept-icon-circle">{dept.icon}</div>
                  <div className="dept-details">
                    <h3 className="dept-public-name">{dept.name}</h3>
                    <div className="dept-contact-list">
                      <div className="contact-item">
                        <span className="contact-icon">👤</span>
                        <span className="contact-text">{dept.headName}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <span className="contact-text">{dept.phone}</span>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">✉️</span>
                        <span className="contact-text">{dept.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
