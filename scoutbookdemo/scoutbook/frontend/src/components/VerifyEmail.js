import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/verify-email.css';

export default function VerifyEmail({ onLogin }) {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        setStatus('verifying');
        setMessage('Verifying your email address...');

        const response = await axios.get(
          `https://scoutbookfyp1.onrender.com/api/auth/verify-email/${token}`
        );

        // Verification successful
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');

        // Store token and user data for auto-login
        if (response.data.token && response.data.user) {
          localStorage.setItem('sb_token', response.data.token);
          localStorage.setItem('sb_user', JSON.stringify(response.data.user));
          
          // Update app state
          if (onLogin) {
            onLogin(response.data.user);
          }

          // Redirect to dashboard immediately (no delay)
          navigate('/dashboard');
        } else {
          // If no auto-login, redirect to login page after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        
        if (error.response?.data?.error) {
          setMessage(error.response.data.error);
        } else {
          setMessage('Failed to verify email. The link may be invalid or expired.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate, onLogin]);

  return (
    <div className="verify-email-page container">
      <div className="verify-email-card">
        {status === 'verifying' && (
          <>
            <div className="verify-icon verifying">
              <span className="material-icons spinning">hourglass_empty</span>
            </div>
            <h2>Verifying Your Email</h2>
            <p className="verify-message">{message}</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon success">
              <span className="material-icons">check_circle</span>
            </div>
            <h2>Email Verified!</h2>
            <p className="verify-message">{message}</p>
            <p className="redirect-message">Logging you in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon error">
              <span className="material-icons">error</span>
            </div>
            <h2>Verification Failed</h2>
            <p className="verify-message error-text">{message}</p>
            
            <div className="verify-actions">
              <button 
                className="btn primary"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              
              <button 
                className="btn secondary"
                onClick={() => navigate('/signin')}
              >
                Create New Account
              </button>
            </div>

            <div className="help-text">
              <p>Need help?</p>
              <ul>
                <li>Make sure you're using the latest verification link</li>
                <li>Verification links expire after 24 hours</li>
                <li>You can request a new verification email from the login page</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
