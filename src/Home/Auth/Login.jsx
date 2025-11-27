import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    resetErrors();
    if (validate()) {
      setShowSuccess(true);
      localStorage.setItem("isLoggedIn", "true");
      console.log("Login successful", { email, password });
      // Navigate to portal after 1.5 seconds
      setTimeout(() => {
        navigate("/");
      }, 1500);
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
      {Object.values(errors).some((error) => error) && (
        <div className="error-notification show">
          Please fix the errors above.
        </div>
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
              />
            </div>
            <p className={`error-message ${errors.password ? "show" : ""}`}>
              {errors.password}
            </p>
          </div>

          <button type="submit" className="btn-login">
            Login
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
