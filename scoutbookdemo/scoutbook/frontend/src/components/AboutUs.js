import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about-us.css';
import discover3 from '../assests/discover3.jpg';

export default function AboutUs() {
  return (
    <div className="about-us-page">
      {/* Navigation Bar - Same as Landing */}
      <nav className="landing-nav-transparent about-nav-fixed">
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
            <Link to="/about" className="landing-nav-link-transparent active">About Us</Link>
            <Link to="/contact" className="landing-nav-link-transparent">Contact Us</Link>
          </div>
          
          <div className="landing-nav-actions-transparent">
            <Link to="/login" className="landing-nav-btn-transparent">Login</Link>
            <Link to="/signin" className="landing-nav-btn-transparent primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero-section" style={{ backgroundImage: `url(${discover3})` }}>
          <div className="about-hero-overlay">
            <div className="about-hero-content">
              <p className="about-hero-label">ESTABLISHED 2020</p>
              <h1 className="about-hero-title">Empowering cricket talent through clarity and opportunity.</h1>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-story-section">
          <div className="about-story-container">
            <div className="about-story-left">
              <div className="about-divider"></div>
              <h2 className="about-story-heading">The Journey</h2>
              <p className="about-story-subtext">Connecting athletes with their dreams since day one.</p>
            </div>
            <div className="about-story-right">
              <div className="about-story-content">
                <p>Founded in 2020, ScoutBook emerged from a simple vision: to democratize cricket talent discovery. We recognized that exceptional talent often goes unnoticed due to lack of visibility and proper platforms.</p>
                <p>What began as a passion project has grown into a comprehensive platform serving thousands of players, scouts, and organizations. Our commitment remains unwavering—to create transparent pathways for talent to shine and for opportunities to find the right people.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="about-values-section">
          <div className="about-values-container">
            <div className="about-values-header">
              <p className="about-values-label">ETHOS</p>
              <h2 className="about-values-title">Our Core Values</h2>
            </div>
            <div className="about-values-grid">
              <div className="about-value-card">
                <span className="material-icons about-value-icon">verified</span>
                <p className="about-value-name">TRANSPARENCY</p>
              </div>
              <div className="about-value-card">
                <span className="material-icons about-value-icon">lightbulb</span>
                <p className="about-value-name">INNOVATION</p>
              </div>
              <div className="about-value-card">
                <span className="material-icons about-value-icon">groups</span>
                <p className="about-value-name">COMMUNITY</p>
              </div>
              <div className="about-value-card">
                <span className="material-icons about-value-icon">auto_awesome</span>
                <p className="about-value-name">EXCELLENCE</p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="about-offer-section">
          <div className="about-offer-container">
            <h2 className="about-offer-title">What We Offer</h2>
            <p className="about-offer-subtitle">Comprehensive solutions for every stakeholder in cricket.</p>
            <div className="about-offer-grid">
              <div className="about-offer-card">
                <span className="material-icons about-offer-icon">person</span>
                <h3>For Players</h3>
                <p>Build your cricket profile, showcase your talent, and connect with scouts and organizations looking for the next generation of stars.</p>
              </div>
              <div className="about-offer-card">
                <span className="material-icons about-offer-icon">search</span>
                <h3>For Scouts</h3>
                <p>Discover talented players, manage your recruitment pipeline, and post opportunities to reach the best cricket talent.</p>
              </div>
              <div className="about-offer-card">
                <span className="material-icons about-offer-icon">emoji_events</span>
                <h3>Tournaments</h3>
                <p>Organize tournaments, track player performance, and identify emerging talent in a centralized platform.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="about-cta-section">
          <div className="about-cta-content">
            <h2>Ready to transform your cricket journey?</h2>
            <Link to="/signin" className="about-cta-button">GET STARTED</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="about-footer">
        <div className="about-footer-container">
          <div className="about-footer-content">
            <div className="about-footer-brand">
              <span className="material-icons">sports_cricket</span>
              <span>SCOUTBOOK</span>
            </div>
            <p>&copy; 2026 ScoutBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
