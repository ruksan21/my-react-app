import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";
import Profile from "../Profile/profile.jsx";
import WardSelector from "../Component/wadaselector.jsx";
import Notification from "../Component/Notification.jsx";
import UserMenu from "../Component/UserMenu.jsx";
import HeroSection from "../Pages/HeroSection.jsx";
import Status from "../Pages/Status.jsx";
import { useWard } from "../Context/WardContext.jsx";

const Navbar = ({ showHomeContent = false }) => {
  const { municipality, ward } = useWard();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const selectedMuni = useMemo(
    () =>
      municipality && ward
        ? `${municipality} - Ward ${ward}`
        : "Select Municipality",
    [municipality, ward]
  );

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Documents", path: "/documents" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
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
          <Notification />
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
