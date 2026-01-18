import React, { useState } from "react";
import Navbar from "../Nav/Navbar";
import "./OfficerPublicProfile.css";
import { useLanguage } from "../Context/useLanguage";
import { toNepaliNumber } from "../../data/nepal_locations";

export default function OfficerPublicProfile() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");

  const isNP = language === "NP";

  // Mock Data matching the screenshot
  const officerData = {
    name: isNP ? "के छ के" : "k xa k",
    role: isNP
      ? "वडा अध्यक्ष - इटहरी उप-महानगरपालिका, वडा नं. २"
      : "wardChairperson - Itahari Sub-Metropolitan City , Ward No. 2",
    phone: isNP ? toNepaliNumber("9807314413") : "9807314413",
    email: "ugherughoreughr@gmail.com",
    address: isNP
      ? "इटहरी उप-महानगरपालिका - वडा २"
      : "Itahari Sub-Metropolitan City - Ward 2",
    followers: 3,
    rating: 3.3,
    reviewCount: 4,
  };

  const topStats = [
    {
      label: t("profile.total_works"),
      value: isNP ? toNepaliNumber(4) : 4,
      icon: "💼",
      color: "#8e44ad",
    },
    {
      label: t("profile.completed_works"),
      value: isNP ? toNepaliNumber(2) : 2,
      icon: "✅",
      color: "#27ae60",
    },
    {
      label: t("profile.avg_rating"),
      value: isNP ? toNepaliNumber(3.3) : 3.3,
      icon: "⭐",
      color: "#f1c40f",
    },
    {
      label: t("profile.followers"),
      value: isNP ? toNepaliNumber(3) : 3,
      icon: "👥",
      color: "#2c3e50",
    },
  ];

  const dashboardData = {
    totalBudget: isNP
      ? `रु. ${toNepaliNumber("4000000000.00")}`
      : "Rs. 4000000000.00",
    spentAmount: isNP ? `रु. ${toNepaliNumber("4.01")}` : "Rs. 4.01",
    remainingBudget: isNP
      ? `रु. ${toNepaliNumber("3,99,99,99,995.99")}`
      : "Rs. 3,99,99,99,995.99",
    progress: 50,
    beneficiaryPopulation: 31,
  };

  const tabs = [
    { id: "details", label: t("profile.tabs.details") },
    { id: "property", label: t("profile.tabs.property") },
    { id: "works", label: t("profile.tabs.works") },
    { id: "assets", label: t("profile.tabs.assets") },
    { id: "activities", label: t("profile.tabs.activities") },
    { id: "reviews", label: t("profile.tabs.reviews") },
    { id: "dashboard", label: t("profile.tabs.dashboard") },
  ];

  return (
    <>
      <Navbar showHomeContent={false} />
      <div className="officer-public-profile">
        <div className="profile-wrapper">
          {/* 1. Top Stats Row */}
          <div className="stats-overview">
            {topStats.map((stat, index) => (
              <div key={index} className="stat-box">
                <div
                  className="stat-icon-wrapper"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Profile Header Card */}
          <div className="profile-header-card">
            <div className="profile-header-top">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  <span style={{ color: "white", fontSize: "1.5rem" }}>
                    {officerData.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="profile-main-info">
                <div className="profile-name-row">
                  <h1>{officerData.name}</h1>
                  <div className="rating-display">
                    <span className="stars">⭐⭐⭐☆☆</span>
                    <span className="rating-text">
                      {isNP
                        ? toNepaliNumber(officerData.rating)
                        : officerData.rating}{" "}
                      (
                      {isNP
                        ? toNepaliNumber(officerData.reviewCount)
                        : officerData.reviewCount}{" "}
                      {t("profile.reviews")})
                    </span>
                  </div>
                </div>
                <p className="profile-role">{officerData.role}</p>
                <div className="profile-contact-row">
                  <span className="contact-pill">
                    <i className="fa-solid fa-phone"></i> {officerData.phone}
                  </span>
                  <span className="contact-pill">
                    <i className="fa-solid fa-envelope"></i> {officerData.email}
                  </span>
                </div>
              </div>
              <div className="profile-actions">
                <div className="followers-count">
                  <i className="fa-solid fa-user"></i>{" "}
                  {isNP
                    ? toNepaliNumber(officerData.followers)
                    : officerData.followers}{" "}
                  {t("profile.followers")}
                </div>
                <button className="follow-btn">{t("profile.follow")}</button>
              </div>
            </div>

            {/* 3. Tabs Navigation (inside card) */}
            <div className="profile-tabs-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-link ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tab Content Area */}
          <div className="tab-content-area">
            {activeTab === "dashboard" && (
              <div className="dashboard-content">
                <div className="dashboard-header-text">
                  <span className="location-pin">📍</span> {officerData.address}
                </div>

                {/* Budget Cards Grid */}
                <div className="budget-dashboard-grid">
                  <div className="budget-card blue-card">
                    <div className="card-header">
                      <span className="card-title">
                        {t("profile.dashboard.total_budget")}
                      </span>
                      <span className="card-icon">💰</span>
                    </div>
                    <div className="card-amount blue-text">
                      {dashboardData.totalBudget}
                    </div>
                  </div>

                  <div className="budget-card orange-card">
                    <div className="card-header">
                      <span className="card-title">
                        {t("profile.dashboard.spent_amount")}
                      </span>
                      <span className="card-icon">💳</span>
                    </div>
                    <div className="card-amount orange-text">
                      {dashboardData.spentAmount}
                    </div>
                  </div>

                  <div className="budget-card green-card">
                    <div className="card-header">
                      <span className="card-title">
                        {t("profile.dashboard.remaining_budget")}
                      </span>
                      <span className="card-icon">📄</span>
                    </div>
                    <div className="card-amount green-text">
                      {dashboardData.remainingBudget}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Work Progress & Beneficiary */}
                <div className="dashboard-bottom-row">
                  <div className="progress-card">
                    <h4>{t("profile.dashboard.work_progress")}</h4>
                    <div className="progress-status">
                      <span>{t("profile.dashboard.completed")}</span>
                      <span>
                        {isNP
                          ? toNepaliNumber(dashboardData.progress)
                          : dashboardData.progress}
                        %
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${dashboardData.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="beneficiary-card">
                    <h4>{t("profile.dashboard.beneficiary_population")}</h4>
                    <div className="beneficiary-number">
                      {isNP
                        ? toNepaliNumber(dashboardData.beneficiaryPopulation)
                        : dashboardData.beneficiaryPopulation}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholders for other tabs */}
            {activeTab !== "dashboard" && (
              <div className="content-placeholder">
                <h3>
                  {tabs.find((t) => t.id === activeTab)?.label}{" "}
                  {t("common.success")}
                </h3>
                <p>{t("common.loading")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
