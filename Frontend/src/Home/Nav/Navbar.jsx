import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import "./Navbar.css";
import Profile from "../Profile/profile.jsx";
import WardSelector from "../Component/wadaselector.jsx";
import UserMenu from "../Component/UserMenu.jsx";
import Notification from "../Component/Notification.jsx";
import HeroSection from "../Pages/HeroSection.jsx";
import Status from "../Pages/Status.jsx";
import { useWard } from "../Context/WardContext.jsx";
// import { useAuth } from "../Context/AuthContext.jsx";

import { useLanguage } from "../Context/useLanguage";

const Navbar = ({ showHomeContent = false }) => {
  const { municipality, ward } = useWard();
  const { t, language, toggleLanguage } = useLanguage();
  // const { user } = useAuth(); // User no longer needed for notification logic

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedMuni = useMemo(
    () =>
      municipality && ward
        ? `${municipality} - ${t("nav.ward")} ${ward}`
        : t("nav.select_muni"),
    [municipality, ward, t],
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.documents"), path: "/documents" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" },
  ];

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        {/* Left Section - Logo */}
        <div className="navbar-left">
          <Link to="/" className="logo" onClick={closeMenu}>
            Ward Portal
          </Link>
        </div>

        {/* Center Section - Navigation Links (Desktop Only) */}
        <div className="navbar-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${
                location.pathname === link.path ? "active" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Section - Ward Selector, Notification, User Menu */}
        <div className="navbar-right">
          <WardSelector />

          {/* Language Toggle */}
          <button
            className="lang-toggle-btn"
            onClick={toggleLanguage}
            style={{
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            <span
              className="lang-toggle-text"
              style={{ fontSize: "14px", fontWeight: "600", color: "#4a5568" }}
            >
              {language}
            </span>
            <i
              className="fa-solid fa-globe"
              style={{ marginLeft: "8px", color: "#718096" }}
            ></i>
          </button>

          <UserMenu />

          {/* Hamburger Menu Icon (Mobile Only) */}
          <button
            className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-nav-drawer ${isMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <span className="mobile-muni-info">{selectedMuni}</span>
            <button className="close-menu-btn" onClick={closeMenu}>
              ✕
            </button>
          </div>
          <div className="mobile-links-list">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-nav-link ${
                  location.pathname === link.path ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Only shown if showHomeContent is true */}
      {showHomeContent && (
        <>
          <main className="main-content">
            <HeroSection selectedMuni={selectedMuni} />
            <Status />
          </main>
          <Profile />
        </>
      )}
    </div>
  );
};

export default Navbar;
