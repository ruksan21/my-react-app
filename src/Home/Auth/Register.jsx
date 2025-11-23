import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [wardNumber, setWardNumber] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const resetErrors = () => {
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    });
  };

  const validate = () => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required!';
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required!';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required!';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required!';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return (
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword &&
      !newErrors.firstName &&
      !newErrors.lastName
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetErrors();
    if (validate()) {
      setShowSuccess(true);
      console.log('Registration successful', {
        email,
        password,
        firstName,
        middleName,
        lastName,
        contactNumber,
        dob,
        gender,
        district,
        city,
        wardNumber,
      });
      setTimeout(() => {
        navigate('/');
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
        <div className="success-notification show">Registration successful!</div>
      )}
      {Object.values(errors).some((error) => error) && (
        <div className="error-notification show">Please fix the errors above.</div>
      )}

      <div className="login-container">
        <div className="login-header">
          <h1>Create your account</h1>
          <p>Please register to continue</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="name-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className={`form-control ${errors.firstName ? 'error' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <p className={`error-message ${errors.firstName ? 'show' : ''}`}>
                {errors.firstName}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                className={`form-control ${errors.lastName ? 'error' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <p className={`error-message ${errors.lastName ? 'show' : ''}`}>
                {errors.lastName}
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              placeholder="Enter your middle name"
              className="form-control"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <i className="fa-regular fa-envelope" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                className={`form-control ${errors.email ? 'error' : ''}`}
                maxLength={100}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className={`error-message ${errors.email ? 'show' : ''}`}>
              {errors.email}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-phone" />
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                placeholder="Enter your contact number"
                className="form-control"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-calendar" />
              <input
                type="date"
                id="dob"
                name="dob"
                className="form-control"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-venus-mars" />
              <select
                id="gender"
                name="gender"
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="district">District (Address)</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-map-marker-alt" />
              <input
                type="text"
                id="district"
                name="district"
                placeholder="Enter your district"
                className="form-control"
                maxLength={30}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="city">City (Address)</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-city" />
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter your city"
                className="form-control"
                maxLength={30}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="wardNumber">Ward Number (Address)</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-map" />
              <input
                type="text"
                id="wardNumber"
                name="wardNumber"
                placeholder="Enter your ward number"
                className="form-control"
                maxLength={30}
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
              />
            </div>
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
                className={`form-control ${errors.password ? 'error' : ''}`}
                maxLength={50}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className={`error-message ${errors.password ? 'show' : ''}`}>
              {errors.password}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock" />
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                maxLength={50}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <p className={`error-message ${errors.confirmPassword ? 'show' : ''}`}>
              {errors.confirmPassword}
            </p>
          </div>

          <button type="submit" className="btn-login">
            Register
          </button>

          <div className="already-account">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
