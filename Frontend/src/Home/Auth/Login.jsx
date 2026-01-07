import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./Login.css";
import { API_ENDPOINTS } from "../../config/api";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const resetErrors = () => setErrors({ email: "", password: "" });

  const validate = () => {
    const newErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!email.trim()) newErrors.email = "Email is required!";
    else if (!emailRegex.test(email))
      newErrors.email = "Enter a valid email address";

    if (!password) newErrors.password = "Password is required!";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

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
        // Handle error response
        setErrors({
          email: "",
          password: data.message || "Login failed. Please try again.",
        });
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
      setShowSuccess(true);

      // Redirect after showing success
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        email: "",
        password: "Network error. Please check your connection and try again.",
      });
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

      {showSuccess && (
        <div className="success-notification show">Login successful!</div>
      )}

      <div className="login-container">
        <div className="login-header">
          <h1>Login your account</h1>
          <p> Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-user" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
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
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
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
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="forgot-password">
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>

        <div className="register-link">
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
