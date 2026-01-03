import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import "./Forget.css";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [citizenshipNumber, setCitizenshipNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !citizenshipNumber || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          citizenshipNumber,
          newPassword: password,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
        console.error("Reset password error:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="forget-root">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {showSuccess && (
        <div className="success-notification show">
          Password reset successful! Redirecting to login...
        </div>
      )}
      {error && <div className="error-notification show">{error}</div>}

      <div className="forget-container">
        <div className="forget-header">
          <div className="icon-badge">
            <i className="fa-solid fa-shield-alt"></i>
          </div>
          <h1>Reset Password</h1>
          <p>Verify your identity to set a new password.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Citizenship Number</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-id-card"></i>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Citizenship Number"
                value={citizenshipNumber}
                onChange={(e) => setCitizenshipNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-shield-halved"></i>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-forget" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="forget-footer">
          <Link to="/login">
            <i className="fa-solid fa-arrow-left"></i> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
