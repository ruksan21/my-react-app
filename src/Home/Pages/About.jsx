import React from "react";
import "./About.css";
import missionImage from "../../Image/Home.png";
import Navbar from "../Nav/Navbar";

const translations = {
  en: {
    title: "About Us",
    subtitle: "For Transparent and Accountable Local Governance",
    mission: "Our Mission",
    missionText1:
      "Ward Chairperson Portal is a digital platform built to bring transparency and accountability to local governance in Nepal.",
    missionText2:
      "We believe that access to information and citizen participation are the foundations of strong democracy.",
    features: "Key Features",
    featureDesc: "Feature description goes here.",
  },
  ne: {
    title: "हाम्रो बारेमा",
    subtitle: "पारदर्शी र जवाफदेही स्थानीय शासनको लागि",
    mission: "हाम्रो उद्देश्य",
    missionText1:
      "वडा अध्यक्ष पोर्टल नेपालको स्थानीय शासनमा पारदर्शिता र जवाफदेहिता ल्याउने उद्देश्यले निर्माण गरिएको डिजिटल प्लेटफर्म हो।",
    missionText2:
      "हामी विश्वास गर्छौं कि सूचनाको पहुँच र नागरिक सहभागिता मजबुत लोकतन्त्रको आधार हो।",
    features: "मुख्य सुविधाहरू",
    featureDesc: "सुविधाको विवरण यहाँ राखिएको छ।",
  },
};

const FEATURES = [
  { title: "Transparency", icon: "📊", color: "#3b82f6" },
  { title: "Participation", icon: "👥", color: "#16a34a" },
  { title: "Progress", icon: "📈", color: "#9333ea" },
];

export default function About() {
  const language = "en";
  const t = translations[language];

  return (
    <>
      {/* Navigation Bar */}
      <Navbar />
      {/* About Page Content */}
      <div className="about-container">
        <div className="about-hero">
          <div className="about-hero-content">
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>
        </div>

        <div className="about-content">
          <section className="mission-section">
            <div className="mission-text">
              <h2>{t.mission}</h2>
              <p>{t.missionText1}</p>
              <p>{t.missionText2}</p>
            </div>
            <div className="mission-image">
              <img src={missionImage} alt="Mission" />
            </div>
          </section>

          <section className="features-section">
            <h2>{t.features}</h2>
            <div className="features-grid">
              {FEATURES.map((item, i) => (
                <div className="feature-card" key={i}>
                  <span style={{ fontSize: "40px" }}>{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{t.featureDesc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
