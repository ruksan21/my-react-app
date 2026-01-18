import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./RoleSelection.css";
import { useLanguage } from "../Context/useLanguage";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          <h1>{t("role.welcome")}</h1>
          <p>{t("role.choose_role")}</p>
        </div>

        <div className="role-cards">
          <div
            className="role-card"
            onClick={() => handleRoleSelect("citizen")}
          >
            <div className="role-card-icon citizen">
              <i className="fa-solid fa-user"></i>
            </div>
            <h2>{t("role.citizen")}</h2>
            <p>{t("role.citizen_desc")}</p>
            <button className="role-card-btn citizen-btn">
              {t("role.citizen_btn")}
            </button>
          </div>

          <div
            className="role-card"
            onClick={() => handleRoleSelect("officer")}
          >
            <div className="role-card-icon officer">
              <i className="fa-solid fa-user-tie"></i>
            </div>
            <h2>{t("role.officer")}</h2>
            <p>{t("role.officer_desc")}</p>
            <button className="role-card-btn officer-btn">
              {t("role.officer_btn")}
            </button>
          </div>
        </div>

        <div className="already-account">
          <p>
            {t("role.already_account")}{" "}
            <Link to="/login">{t("role.login_here")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
