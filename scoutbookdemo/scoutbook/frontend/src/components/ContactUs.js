import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/contact-us.css';
import { contactAPI } from '../services/api';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await contactAPI.sendMessage({
        name: formData.name,
        email: formData.email,
        message: formData.message
      });

      setSuccessMessage('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-us-page">
      {/* Navigation Bar - Same as Landing */}
      <nav className="landing-nav-transparent contact-nav-fixed">
        <div className="landing-nav-container-transparent">
          <div className="landing-nav-logo">
            <span className="landing-logo-icon">
              <span className="material-icons">sports_cricket</span>
            </span>
            <span className="landing-logo-text">SCOUTBOOK</span>
          </div>
          
          <div className="landing-nav-links-transparent">
            <Link to="/" className="landing-nav-link-transparent">Home</Link>
            <Link to="#features" className="landing-nav-link-transparent">Features</Link>
            <Link to="#pricing" className="landing-nav-link-transparent">Pricing</Link>
            <Link to="/about" className="landing-nav-link-transparent">About Us</Link>
            <a href="#contact" className="landing-nav-link-transparent active">Contact Us</a>
          </div>
          
          <div className="landing-nav-actions-transparent">
            <Link to="/login" className="landing-nav-btn-transparent">Login</Link>
            <Link to="/signin" className="landing-nav-btn-transparent primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero-section">
          <div className="contact-hero-content">
            <p className="contact-hero-label">GET IN TOUCH</p>
            <h1 className="contact-hero-title">Let's Connect</h1>
            <p className="contact-hero-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="contact-content-section">
          <div className="contact-content-container">
            {/* Contact Form */}
            <div className="contact-form-wrapper">
              {successMessage && (
                <div className="contact-success-message">
                  <span className="material-icons">check_circle</span>
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="contact-error-message">
                  <span className="material-icons">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-group">
                  <label htmlFor="name" className="contact-label">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="contact-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="contact-input"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="message" className="contact-label">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your inquiry..."
                    className="contact-textarea"
                    rows="5"
                    required
                    disabled={loading}
                  ></textarea>
                </div>

                <button type="submit" className="contact-submit-btn" disabled={loading}>
                  <span>{loading ? 'SENDING...' : 'SEND MESSAGE'}</span>
                  <span className="material-icons">arrow_forward</span>
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="contact-details-wrapper">
              <div className="contact-detail-block">
                <p className="contact-detail-label">EMAIL</p>
                <a href="mailto:lamauthantha@gmail.com" className="contact-detail-value">
                  lamauthantha@gmail.com
                </a>
              </div>

              <div className="contact-detail-block">
                <p className="contact-detail-label">OFFICE</p>
                <address className="contact-detail-address">
                  <p>Humla, Simkot</p>
                  <p>Nepal</p>
                </address>
              </div>

              <div className="contact-detail-block">
                <p className="contact-detail-label">FOLLOW US</p>
                <div className="contact-social-links">
                  <a href="#" className="contact-social-link">LinkedIn</a>
                  <a href="#" className="contact-social-link">Instagram</a>
                  <a href="#" className="contact-social-link">Twitter</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="material-icons">sports_cricket</span>
              <span className="footer-logo-text">ScoutBook</span>
            </div>
            <p className="footer-text">Connecting athletes with opportunities</p>
            <p className="footer-copyright">&copy; 2026 ScoutBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
