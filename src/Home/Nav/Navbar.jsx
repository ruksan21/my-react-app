import { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import Profile from "../Profile/profile.jsx";
import WardSelector from "../Component/wadaselector.jsx";
import HeroSection from "../Pages/HeroSection.jsx";
import Status from "../Pages/Status.jsx";

const Navbar = ({ showHomeContent = false }) => {
  const [selectedMuni, setSelectedMuni] = useState("Select Municipality");

  return (
    <div className="app">
      {/* Top Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="logo">वडा पोर्टल</span>
        </div>
        <div className="navbar-center">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          <a href="#contact" className="nav-link">
            Contact
          </a>
        </div>
        <div className="navbar-center">
          <WardSelector
            onWardSelect={(muni, ward) =>
              setSelectedMuni(`${muni} - Ward ${ward}`)
            }
          />
        </div>
        <Link to="/login" className="login-btn">
          login
        </Link>
      </nav>

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
