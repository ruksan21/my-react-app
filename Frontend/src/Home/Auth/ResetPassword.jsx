import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import "./Forget.css";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Token from URL
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.warning("Please fill all fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.warning("Password must be at least 8 characters long.");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.warning("Password must contain at least one number.");
      return;
    }
    if (!/[\W_]/.test(newPassword)) {
      toast.warning(
        "Password must contain at least one special character (e.g. @, #, $).",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(API_ENDPOINTS.auth.resetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await resp.json();

      if (data.success) {
        toast.success(data.message || "Password reset successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Reset failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="forget-container">
      <form className="forget-form" onSubmit={handleSubmit}>
        <div className="forget-title">Reset Password</div>
        <div className="forget-desc">Set a new password for your account.</div>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="forget-back" onClick={() => navigate("/login")}>
          &larr; Back to Login
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;
