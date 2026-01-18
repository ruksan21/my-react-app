import React from "react";
import { useLanguage } from "../Context/useLanguage";
import HeroImage from "../../Image/Home.png";

// Reusable hero section component.
// Displays ward chairperson heading and currently selected municipality/ward.
// Props:
// - selectedMuni: string to show current selection (defaults to placeholder)
const HeroSection = ({ selectedMuni }) => {
  const { t } = useLanguage();
  const displayMuni = selectedMuni || t("hero.select_placeholder");

  return (
    <section className="hero">
      <img src={HeroImage} alt="Hero" />
      <div className="hero-overlay">
        <h1>{t("hero.title")}</h1>
        <p>{t("hero.subtitle")}</p>
        <div className="selected-muni">{displayMuni}</div>
      </div>
    </section>
  );
};

export default HeroSection;
