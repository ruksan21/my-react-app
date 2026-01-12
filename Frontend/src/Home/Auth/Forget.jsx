import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import "./Forget.css";
import { toast } from "react-toastify";

export default function ForgetPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code+Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.sendResetLink, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail: email }),
      });
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          toast.success("Reset code sent to your email!");
          setStep(2); // Move to next step
        } else {
          toast.error(data.message || "Failed to send code.");
        }
      } catch (e) {
        console.error("Server Error:", text);
        toast.error("Server Error. Check console.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          code: code,
          newPassword: newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Password reset successful! Please login.");
        navigate("/login");
      } else {
        toast.error(data.message || "Reset failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error.");
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

      <div className="forget-container">
        <div className="forget-box">
          <div className="icon-container">
            <i className="fas fa-shield-alt"></i>
          </div>

          {step === 1 ? (
            <>
              <h2>Reset Password</h2>
              <p>Enter your email to receive a verification code.</p>
              <form onSubmit={handleSendCode}>
                <div className="input-group">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="reset-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </button>
                <Link to="/login" className="back-link">
                  ← Back to Login
                </Link>
              </form>
            </>
          ) : (
            <>
              <h2>Verify & Reset</h2>
              <p>Enter the code sent to {email}</p>
              <form onSubmit={handleResetPassword}>
                <div className="input-group">
                  <i className="fas fa-key"></i>
                  <input
                    type="text"
                    placeholder="6-Digit Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <i className="fas fa-check-circle"></i>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="reset-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
                <button
                  type="button"
                  className="back-link"
                  onClick={() => setStep(1)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  ← Change Email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
