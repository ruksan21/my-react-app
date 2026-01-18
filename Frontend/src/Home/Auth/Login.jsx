import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./Login.css";
import { API_ENDPOINTS } from "../../config/api";
import { toast } from "react-toastify";
import { useLanguage } from "../Context/useLanguage";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const resetErrors = () => setErrors({ email: "", password: "" });

  const validate = () => {
    const newErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!email.trim()) newErrors.email = t("auth.required");
    else if (!emailRegex.test(email)) newErrors.email = t("auth.email_invalid");

    if (!password) newErrors.password = t("auth.required");
    else if (password.length < 8) newErrors.password = t("auth.password_min");

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetErrors();

    if (!validate()) return;

    setIsLoading(true);

    try {
      // Call login API
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle specific account status errors (403)
        if (response.status === 403) {
          toast.error(data.message || t("auth.access_denied"));
        } else {
          // Handle normal validation errors (401, 404, etc.)
          toast.error(data.message || t("auth.login_failed"));
        }
        setIsLoading(false);
        return;
      }

      // Login successful
      const userData = data.data.user;
      const workLocation = data.data.workLocation || null;
      const authToken = data.data.token;

      // Save token and user to localStorage
      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update context with work location
      login(userData, workLocation);
      toast.success(t("auth.login_success"));

      // Redirect after showing success
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("auth.network_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div className="login-container">
        <div className="login-header">
          <h1>{t("auth.login_header")}</h1>
          <p> {t("auth.login_subheader")}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">{t("auth.email")}</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-user" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t("auth.enter_email")}
                className={`form-control ${errors.email ? "error" : ""}`}
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className={`error-message ${errors.email ? "show" : ""}`}>
              {errors.email}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("auth.password")}</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder={t("auth.enter_password")}
                className={`form-control ${errors.password ? "error" : ""}`}
                maxLength={50}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <p className={`error-message ${errors.password ? "show" : ""}`}>
              {errors.password}
            </p>
          </div>

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? t("auth.logging_in") : t("auth.login_title")}
          </button>
        </form>

        <div className="forgot-password">
          <p>
            <Link to="/forgot-password">{t("auth.forgot_password")}</Link>
          </p>
        </div>

        <div className="register-link">
          <p>
            {t("auth.dont_have_account")}{" "}
            <Link to="/register">{t("auth.register_here")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
