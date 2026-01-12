import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === "citizen") {
      navigate("/register/citizen");
    } else if (role === "officer") {
      navigate("/register/officer");
    }
  };

  return (
    <div className="role-selection-root">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="role-selection-container">
        <div className="role-selection-header">
          <h1>Welcome to Ward Portal</h1>
          <p>Please choose your role to continue registration</p>
        </div>

        <div className="role-cards">
          <div
            className="role-card"
            onClick={() => handleRoleSelect("citizen")}
          >
            <div className="role-card-icon citizen">
              <i className="fa-solid fa-user"></i>
            </div>
            <h2>Citizen</h2>
            <p>Register as a citizen to access ward services and information</p>
            <button className="role-card-btn citizen-btn">
              Register as Citizen
            </button>
          </div>

          <div
            className="role-card"
            onClick={() => handleRoleSelect("officer")}
          >
            <div className="role-card-icon officer">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <h2>Ward Officer</h2>
            <p>Register as an officer to manage ward operations and services</p>
            <button className="role-card-btn officer-btn">
              Register as Officer
            </button>
          </div>
        </div>

        <div className="already-account">
          <p>
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
