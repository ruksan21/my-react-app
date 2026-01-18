import React from "react";
import "./About.css";
import Navbar from "../Nav/Navbar";
import HomeImage from "../../Image/Home.png";
import PhotoImage from "../../Image/photo.jpeg";
import { useLanguage } from "../Context/useLanguage";

export default function About() {
  const { t } = useLanguage();

  const OBJECTIVES = [
    { icon: "🎯", text: t("about.objectives.bridge") },
    { icon: "📢", text: t("about.objectives.transparency") },
    { icon: "🤝", text: t("about.objectives.engage") },
    { icon: "💡", text: t("about.objectives.data") },
  ];

  const FEATURES = [
    {
      title: t("about.features.transparency.title"),
      icon: "📊",
      color: "#3b82f6",
      description: t("about.features.transparency.desc"),
    },
    {
      title: t("about.features.participation.title"),
      icon: "👥",
      color: "#16a34a",
      description: t("about.features.participation.desc"),
    },
    {
      title: t("about.features.tracking.title"),
      icon: "📈",
      color: "#9333ea",
      description: t("about.features.tracking.desc"),
    },
    {
      title: t("about.features.accountability.title"),
      icon: "⚖️",
      color: "#ef4444",
      description: t("about.features.accountability.desc"),
    },
    {
      title: t("about.features.access.title"),
      icon: "💻",
      color: "#f59e0b",
      description: t("about.features.access.desc"),
    },
    {
      title: t("about.features.smart.title"),
      icon: "🏛️",
      color: "#8b5cf6",
      description: t("about.features.smart.desc"),
    },
    {
      title: t("about.features.feedback.title"),
      icon: "💬",
      color: "#ec4899",
      description: t("about.features.feedback.desc"),
    },
    {
      title: t("about.features.budget.title"),
      icon: "💰",
      color: "#84cc16",
      description: t("about.features.budget.desc"),
    },
  ];

  const TEAM_MEMBERS = [
    {
      name: "Ruksan Karki",
      role: t("about.roles.project_director"),
      image: PhotoImage,
    },
    {
      name: "Ruksan Karki",
      role: t("about.roles.tech_director"),
      image: HomeImage,
    },
    {
      name: "Ruksan Karki",
      role: t("about.roles.data_analyst"),
      image: HomeImage,
    },
    {
      name: "Lokesh Bhau Karki",
      role: t("about.roles.community_coord"),
      image: PhotoImage,
    },
  ];

  return (
    <>
      {/* Navigation Bar */}
      <Navbar />
      {/* About Page Content */}
      <div className="about-container">
        <div className="about-hero">
          <div className="about-hero-content">
            <h1>{t("about.title")}</h1>
            <p>{t("about.subtitle")}</p>
          </div>
        </div>

        <div className="about-content">
          <section className="mission-section">
            <div className="mission-text">
              <h2>{t("about.mission_title")}</h2>
              <p>{t("about.mission_text_1")}</p>
              <p>{t("about.mission_text_2")}</p>

              <div className="objectives-list">
                <h3>{t("about.objectives_title")}</h3>
                {OBJECTIVES.map((obj, i) => (
                  <div key={i} className="objective-item">
                    <span className="obj-icon">{obj.icon}</span>
                    <span>{obj.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mission-image">
              <img src={HomeImage} alt="Mission" />
            </div>
          </section>

          <section className="features-section">
            <h2>{t("about.features_title")}</h2>
            <div className="features-grid">
              {FEATURES.map((item, i) => (
                <div className="feature-card" key={i}>
                  <div className="feature-icon" style={{ color: item.color }}>
                    <span>{item.icon}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="vision-card">
            <h3>{t("about.vision_title")}</h3>
            <p>{t("about.vision_text")}</p>

            <div className="vision-stats">
              <div className="v-stat">
                <span className="v-number">753</span>
                <span className="v-label">{t("about.stats.local_levels")}</span>
              </div>
              <div className="v-stat">
                <span className="v-number">6,743</span>
                <span className="v-label">{t("about.stats.wards")}</span>
              </div>
              <div className="v-stat">
                <span className="v-number">30M+</span>
                <span className="v-label">{t("about.stats.citizens")}</span>
              </div>
            </div>
          </div>

          <section className="about-team-section">
            <h2>{t("about.team_title")}</h2>
            <div className="team-grid">
              {TEAM_MEMBERS.map((member, i) => (
                <div key={i} className="team-card">
                  <div className="team-image">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="about-contact-section">
            <h2>{t("about.contact_title")}</h2>
            <div className="about-contact-grid">
              <div className="about-contact-card">
                <div className="contact-icon-circle blue">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <h3>{t("about.address")}</h3>
                <p>Singha Durbar, Kathmandu, Nepal</p>
              </div>
              <div className="about-contact-card">
                <div className="contact-icon-circle green">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <h3>{t("about.phone")}</h3>
                <p>+977-9767776999</p>
              </div>
              <div className="about-contact-card">
                <div className="contact-icon-circle purple">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <h3>{t("about.email")}</h3>
                <p>info@wardportal.gov.np</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
