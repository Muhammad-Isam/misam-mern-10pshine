import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import styles from './AuthorisationForm.module.css';

export default function AuthorisationForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: null,
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dateOfBirth: date });
  };

  const handleModeChange = (mode) => {
    setIsLogin(mode);
    setIsForgotPassword(false);
    resetForm();
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsLogin(false);
    setIsForgotPassword(true);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dateOfBirth: null,
      email: '',
      contact: '',
      password: '',
      confirmPassword: '',
      otp: '',
      newPassword: '',
    });
    setError('');
    setMessage('');
    setOtpSent(false);
  };

  const handleForgotPasswordSubmit = async () => {
    setError('');
    setMessage('');

    if (!formData.email) {
      setError('Email is required.');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/auth/forgot-password', { email: formData.email });
      setOtpSent(true);
      setMessage('OTP sent to your email.');
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending OTP.');
    }
  };

  const handleResetPasswordSubmit = async () => {
    setError('');
    setMessage('');

    const { email, otp, newPassword } = formData;
    if (!otp || !newPassword) {
      setError('OTP and new password are required.');
      return;
    }

    try {
      const { data } = await axios.post('http://localhost:5000/auth/reset-password', { email, otp, newPassword });
      setMessage(data.message);
      setIsForgotPassword(false);
      setOtpSent(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error resetting password.');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (isForgotPassword) {
        otpSent ? handleResetPasswordSubmit() : handleForgotPasswordSubmit();
        return;
    }

    if (!isLogin) {
        const { name, dateOfBirth, email, contact, password, confirmPassword } = formData;
        if (!name || !dateOfBirth || !email || !contact || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    } else {
        const { email, password } = formData;
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }
    }

    try {
        const url = isLogin ? 'http://localhost:5000/auth/login' : 'http://localhost:5000/auth/signup';
        const { data } = await axios.post(url, {
            ...formData,
            dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null,
        });

        setMessage(data.message);

        // Store JWT token in local storage after successful login
        if (isLogin && data.message === "Login successful") {
            localStorage.setItem('token', data.token); // Store token
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
            navigate('/Dashboard', { state: { user: data.user } });
        }
    } catch (error) {
        setError(error.response?.data?.message || "Error occurred");
    }
};

  return (
    <div className={styles['authorisation-container']}>
      <div className={styles['form-container']}>
        <div className={styles['form-toggle']}>
          <button className={isLogin && !isForgotPassword ? styles.active : ""} onClick={() => handleModeChange(true)}>
            Login
          </button>
          <button className={!isLogin && !isForgotPassword ? styles.active : ""} onClick={() => handleModeChange(false)}>
            Signup
          </button>
        </div>
        <div className={styles['form']}>
          <h2 className={styles['heading']}>{isForgotPassword ? "Forgot Password" : isLogin ? "Login Form" : "Signup Form"}</h2>
          {isForgotPassword ? (
            otpSent ? (
              <>
                <input type="text" name="otp" placeholder="Enter OTP" value={formData.otp} onChange={handleChange} />
                <input type="password" name="newPassword" placeholder="Enter New Password" value={formData.newPassword} onChange={handleChange} />
              </>
            ) : (
              <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleChange} />
            )
          ) : (
            <>
              {!isLogin && (
                <>
                  <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} />
                  <DatePicker
                    selected={formData.dateOfBirth}
                    onChange={handleDateChange}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Date of Birth"
                    className={styles['date-picker']}
                  />
                  <input type="text" name="contact" placeholder="Enter Contact" value={formData.contact} onChange={handleChange} />
                </>
              )}
              <input type="email" name="email" placeholder="Enter Email" value={formData.email} onChange={handleChange} />
              <input type="password" name="password" placeholder="Enter Password" value={formData.password} onChange={handleChange} />
              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              )}
            </>
          )}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {message && <p className={styles.successMessage}>{message}</p>}
          {isLogin && !isForgotPassword && (
            <a href="#" onClick={handleForgotPassword} className={styles.forgotPasswordLink}>Forgot Password?</a>
          )}
          <button onClick={handleSubmit}>{isForgotPassword && !otpSent ? "Send OTP" : "Submit"}</button>
        </div>
      </div>
    </div>
  );
}
