import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setShowSuccess(true);
      setMessage('Password reset link sent to your email!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setMessage('Please enter a valid email address.');
    }
  };

  return (
    <div className="login-root">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {showSuccess && (
        <div className="success-notification show">{message}</div>
      )}
      {!showSuccess && message && (
        <div className="error-notification show">{message}</div>
      )}

      <div className="login-container">
        <div className="login-header">
          <h1>Forgot Password</h1>
          <p>Enter your email to reset your password</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn-login">Send Reset Link</button>
        </form>

        <div className="forgot-password">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}
