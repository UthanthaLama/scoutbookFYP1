import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import GoogleLogin from './GoogleLogin';
import '../styles/signin.css';

export default function SignIn({ onSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('player');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const navigate = useNavigate();

  // Debounce timer for email validation
  const [emailValidationTimer, setEmailValidationTimer] = useState(null);

  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailDomain = async (email) => {
    if (!validateEmailFormat(email)) {
      setEmailError('Invalid email format');
      return false;
    }

    setValidatingEmail(true);
    setEmailError('');

    try {
      const response = await fetch('https://scoutbookfyp1.onrender.com/api/auth/validate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.valid) {
        setEmailError(data.error || 'Invalid email address');
        return false;
      }

      setEmailError('');
      return true;
    } catch (error) {
      console.error('Email validation error:', error);
      // Don't block on validation errors
      return true;
    } finally {
      setValidatingEmail(false);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError('');

    // Clear previous timer
    if (emailValidationTimer) {
      clearTimeout(emailValidationTimer);
    }

    // Only validate if email looks complete
    if (newEmail.includes('@') && newEmail.includes('.')) {
      // Set new timer to validate after user stops typing (500ms delay)
      const timer = setTimeout(() => {
        validateEmailDomain(newEmail);
      }, 500);
      setEmailValidationTimer(timer);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !confirmPassword || !role) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    // Check for email validation error
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    // Validate email one more time before submitting
    const isEmailValid = await validateEmailDomain(email);
    if (!isEmailValid) {
      setError('Please use a valid email address');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.signup({ email, password, role });
      
      // Check if verification is required
      if (response.requiresVerification) {
        setError('');
        alert('Account created! Please check your email to verify your account before logging in.');
        navigate('/login');
        return;
      }

      // Store token and user data (for backward compatibility)
      if (response.token) {
        localStorage.setItem('sb_token', response.token);
        localStorage.setItem('sb_user', JSON.stringify(response.user));
        onSignup(response.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page container">
      <div className="signin-card">
        <h2>Create your ScoutBook account</h2>
        <p className="muted">Sign up as Player or Scout</p>

        <form onSubmit={handleSubmit} className="signin-form">
          <label>Email
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              required
              className={emailError ? 'input-error' : ''}
            />
            {validatingEmail && <span className="validating-text">Validating email...</span>}
            {emailError && <span className="error-text">{emailError}</span>}
          </label>
          <label>Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
            />
          </label>
          <label>Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </label>
          <label>I am a
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="player">Player</option>
              <option value="scout">Scout</option>
            </select>
          </label>

          {error && <div className="error">{error}</div>}

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <GoogleLogin 
          onSuccess={(user) => {
            onSignup(user);
            navigate('/dashboard');
          }}
          onError={(error) => setError(error)}
        />

        <div className="back-to-login">
          <p>Already have an account?</p>
          <button
            className="btn secondary"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
