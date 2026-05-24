import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
import cricketHero from '../assests/heroImg.jpg';
import athlete1 from '../assests/athlete1.jpg';
import athlete2 from '../assests/athlete2.jpg';
import scout from '../assests/scout.jpg';
import discover1 from '../assests/discover1.jpg';
import discover2 from '../assests/discover2.jpg';
import discover3 from '../assests/discover3.jpg';
import playerImg from '../assests/player.jpg';
import coachImg from '../assests/coach.jpg';

export default function Landing() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleProtectedClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  return (
    <section className="landing">
      {/* Navigation Bar - Transparent Overlay */}
      <nav className="landing-nav-transparent">
        <div className="landing-nav-container-transparent">
          <div className="landing-nav-logo">
            <span className="landing-logo-icon">
              <span className="material-icons">sports_cricket</span>
            </span>
            <span className="landing-logo-text">SCOUTBOOK</span>
          </div>
          
          <div className="landing-nav-links-transparent">
            <a href="#home" className="landing-nav-link-transparent">Home</a>
            <a href="#features" className="landing-nav-link-transparent">Features</a>
            <a href="#pricing" className="landing-nav-link-transparent">Pricing</a>
            <Link to="/about" className="landing-nav-link-transparent">About Us</Link>
            <Link to="/contact" className="landing-nav-link-transparent">Contact Us</Link>
          </div>
          
          <div className="landing-nav-actions-transparent">
            <Link to="/login" className="landing-nav-btn-transparent">Login</Link>
            <Link to="/signin" className="landing-nav-btn-transparent primary">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="landing-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="landing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowLoginModal(false)}>×</button>
            <div className="landing-modal-icon">
              <span className="material-icons">lock</span>
            </div>
            <h3>Login Required</h3>
            <p>Please login or sign up to access this feature</p>
            <div className="landing-modal-actions">
              <Link to="/login" className="landing-modal-btn primary">Login</Link>
              <Link to="/signin" className="landing-modal-btn secondary">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section - Full Screen */}
      <section id="home" className="hero-section-fullscreen">
        {/* Animated Image Gallery Background */}
        <div className="hero-background">
          <div className="hero-image-gallery">
            <div className="gallery-image">
              <img src={cricketHero} alt="Cricket action 1" />
            </div>
            <div className="gallery-image">
              <img src={athlete1} alt="Cricket action 2" />
            </div>
            <div className="gallery-image">
              <img src={athlete2} alt="Cricket action 3" />
            </div>
            <div className="gallery-image">
              <img src={scout} alt="Cricket action 4" />
            </div>
            <div className="gallery-image">
              <img src={cricketHero} alt="Cricket action 5" />
            </div>
          </div>
          <div className="hero-overlay" />
        </div>

        {/* Hero Content */}
        <div className="hero-content-wrapper">
          {/* Main Content Area */}
          <div className="hero-main-content">
            {/* Large Center Title */}
            <div className="hero-center-title">
              <h1 className="hero-massive-title">
                DISCOVER<br />
                YOUR NEXT<br />
                CRICKET STAR
              </h1>
            </div>

            {/* Bottom Layout */}
            <div className="hero-bottom-layout">
              {/* Bottom Left: Text and Buttons */}
              <div className="hero-cta-section">
                <p className="hero-cta-text">
                  Become part of a vibrant community where athletes showcase their talent and scouts discover the next generation of cricket stars.
                </p>
                <div className="hero-cta-buttons">
                  <Link to="/signin" className="hero-cta-btn primary">
                    Join as Player
                  </Link>
                  <Link to="/signin" className="hero-cta-btn secondary">
                    Scout Talent
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <div id="features" className="features-section-redesigned">
        <div className="features-container-redesigned">
          {/* Header */}
          <div className="features-header-redesigned">
            <h2 className="features-title-redesigned">
              Everything you need to <br />
              <span className="features-title-elegant">find talent</span>
            </h2>
            <p className="features-subtitle-redesigned">
              Powerful tools designed specifically for scouts and talent managers to discover the next generation of cricket stars
            </p>
          </div>

          {/* Image Grid with Text Cards Below */}
          <div className="discover-section">
            {/* Image Grid - 3 Images */}
            <div className="discover-images-grid">
              <div className="discover-image-wrapper discover-left">
                <div className="discover-image-card">
                  <img src={discover1} alt="Advanced Search" />
                </div>
              </div>
              
              <div className="discover-image-wrapper discover-center">
                <div className="discover-image-card">
                  <img src={discover3} alt="Video Profiles" />
                </div>
              </div>
              
              <div className="discover-image-wrapper discover-right">
                <div className="discover-image-card">
                  <img src={discover2} alt="Opportunity Management" />
                </div>
              </div>
            </div>

            {/* Horizontal Feature Rows */}
            <div className="horizontal-features">
              {/* Feature 1 */}
              <div className="horizontal-feature-row">
                <div className="horizontal-feature-content">
                  <h3>Advanced Search</h3>
                  <p>Filter players by role, batting style, bowling style, height, and more to find exactly what you're looking for</p>
                </div>
                <div className="horizontal-feature-image">
                  <img src={athlete1} alt="Advanced Search" />
                </div>
                <div className="horizontal-feature-arrow">
                  <span className="material-icons">arrow_forward</span>
                </div>
              </div>

              {/* Feature 2 - Highlighted */}
              <div className="horizontal-feature-row horizontal-feature-highlighted">
                <div className="horizontal-feature-content">
                  <h3>Video Profiles & Stats</h3>
                  <p>Watch player highlights and access comprehensive statistics, achievements, and performance history</p>
                </div>
                <div className="horizontal-feature-image">
                  <img src={athlete2} alt="Video Profiles" />
                </div>
                <div className="horizontal-feature-arrow">
                  <span className="material-icons">arrow_forward</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="horizontal-feature-row">
                <div className="horizontal-feature-content">
                  <h3>Opportunity Management</h3>
                  <p>Post trials, scholarships, and training programs. Track applications in one centralized dashboard</p>
                </div>
                <div className="horizontal-feature-image">
                  <img src={scout} alt="Opportunity Management" />
                </div>
                <div className="horizontal-feature-arrow">
                  <span className="material-icons">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Powerful Portals Section - Split Screen */}
      <section className="portals-split-section">
        {/* Section Header */}
        <div className="portals-section-header">
          <h2 className="portals-main-title">Two Powerful Portals</h2>
          <p className="portals-main-subtitle">Choose your path and unlock your potential in cricket</p>
        </div>

        {/* Portals Container */}
        <div className="portals-container">
          {/* Portal 1: For Players */}
          <div className="portal-split portal-player">
          {/* Background Image */}
          <div className="portal-bg">
            <img src={playerImg} alt="Cricket Player" />
            <div className="portal-overlay"></div>
          </div>

          {/* Content */}
          <div className="portal-content">
            <span className="portal-label">For Players</span>
            <h2 className="portal-title">
              Showcase Your <br />
              <span className="portal-title-italic">Talent</span>
            </h2>
            <ul className="portal-features-list">
              <li>Build comprehensive cricket profile</li>
              <li>Upload highlight videos</li>
              <li>Display achievements and stats</li>
              <li>Browse opportunities like trials</li>
              <li>Connect with professional scouts</li>
            </ul>
            <Link to="/signin" className="portal-cta-btn portal-cta-player">
              <span>Get Started as Player</span>
              <div className="portal-cta-icon">
                <span className="material-icons">arrow_forward</span>
              </div>
            </Link>
          </div>

          {/* Decorative Text */}
          <div className="portal-decorative-text">
            <span>STRIKE</span>
          </div>
        </div>

        {/* Portal 2: For Scouts */}
        <div className="portal-split portal-scout">
          {/* Background Image */}
          <div className="portal-bg">
            <img src={coachImg} alt="Cricket Coach" />
            <div className="portal-overlay"></div>
          </div>

          {/* Content */}
          <div className="portal-content">
            <span className="portal-label portal-label-scout">For Scouts</span>
            <h2 className="portal-title">
              Discover Top <br />
              <span className="portal-title-italic">Talent</span>
            </h2>
            <ul className="portal-features-list">
              <li>Advanced player search & filtering</li>
              <li>View comprehensive profiles & videos</li>
              <li>Post trials and opportunities</li>
              <li>Manage recruitment pipeline</li>
              <li>Direct messaging with athletes</li>
            </ul>
            <Link to="/signin" className="portal-cta-btn portal-cta-scout">
              <span>Get Started as Scout</span>
              <div className="portal-cta-icon">
                <span className="material-icons">analytics</span>
              </div>
            </Link>
          </div>

          {/* Decorative Text */}
          <div className="portal-decorative-text portal-decorative-right">
            <span>VISION</span>
          </div>
        </div>
        </div>

        {/* Central Divider */}
        <div className="portal-divider">
          <div className="portal-divider-line portal-divider-top"></div>
          <div className="portal-divider-badge">
            <span>BEYOND THE FIELD</span>
          </div>
          <div className="portal-divider-line portal-divider-bottom"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="how-it-works-container">
          {/* Header */}
          <div className="how-it-works-header">
            <span className="how-it-works-tag">Simple Process</span>
            <h2 className="animate-fade-in">How It Works</h2>
            <p className="section-desc animate-fade-in animate-delay-1">
              Connect with opportunities and transform your athletic career in four simple steps.
            </p>
          </div>

          {/* Timeline */}
          <div className="timeline-wrapper">
            {/* Vertical line - desktop only */}
            <div className="timeline-line" />

            {/* Step 1 - Left */}
            <div className="timeline-step animate-slide-left">
              <div className="timeline-grid">
                <div className="timeline-content">
                  <div className="timeline-card">
                    <div className="step-number">01</div>
                    <h3>Create Profile</h3>
                    <p>Build your complete athlete profile with stats, achievements, and highlight reels that showcase your potential to scouts and organizations.</p>
                  </div>
                </div>
                <div className="timeline-visual">
                  <div className="visual-box">
                    <img src={athlete1} alt="Create Profile" className="timeline-image" />
                  </div>
                </div>
                <div className="timeline-indicator">
                  <div className="indicator-dot" />
                </div>
              </div>
            </div>

            {/* Step 2 - Right */}
            <div className="timeline-step timeline-step-right animate-slide-right">
              <div className="timeline-grid">
                <div className="timeline-visual timeline-visual-left">
                  <div className="visual-box">
                    <img src={scout} alt="Get Discovered" className="timeline-image" />
                  </div>
                </div>
                <div className="timeline-content timeline-content-right">
                  <div className="timeline-card">
                    <div className="step-number">02</div>
                    <h3>Get Discovered</h3>
                    <p>Scout teams and organizations find you through intelligent matching based on your skills, achievements, and career goals.</p>
                  </div>
                </div>
                <div className="timeline-indicator">
                  <div className="indicator-dot" />
                </div>
              </div>
            </div>

            {/* Step 3 - Left */}
            <div className="timeline-step animate-slide-left">
              <div className="timeline-grid">
                <div className="timeline-content">
                  <div className="timeline-card">
                    <div className="step-number">03</div>
                    <h3>Apply for Trials</h3>
                    <p>Access exclusive trial opportunities, scholarships, and tournaments perfectly matched to your skill level and ambitions.</p>
                  </div>
                </div>
                <div className="timeline-visual">
                  <div className="visual-box">
                    <img src={athlete2} alt="Apply for Trials" className="timeline-image" />
                  </div>
                </div>
                <div className="timeline-indicator">
                  <div className="indicator-dot" />
                </div>
              </div>
            </div>

            {/* Step 4 - Right */}
            <div className="timeline-step timeline-step-right animate-slide-right">
              <div className="timeline-grid">
                <div className="timeline-visual timeline-visual-left">
                  <div className="visual-box">
                    <img src={scout} alt="Professional Development" className="timeline-image" />
                  </div>
                </div>
                <div className="timeline-content timeline-content-right">
                  <div className="timeline-card">
                    <div className="step-number">04</div>
                    <h3>Professional Development</h3>
                    <p>Get mentored by industry professionals and access training resources to elevate your game to the next level.</p>
                  </div>
                </div>
                <div className="timeline-indicator">
                  <div className="indicator-dot" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="how-it-works-cta">
            <p>Ready to take the first step toward your athletic goals?</p>
            <Link to="/signin" className="cta-button">
              <span>Start Your Journey</span>
              <span className="material-icons">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Plans Section */}
      <div id="pricing" className="pricing-section">
        <div className="container">
          <div className="pricing-header">
            <span className="pricing-tag">UPGRADE YOUR GAME</span>
            <h2>Choose Your Plan</h2>
            <p className="section-desc">Select the perfect plan to accelerate your cricket career</p>
          </div>

          <div className="pricing-cards">
            {/* Free Plan */}
            <div className="pricing-card free-plan">
              <h3 className="plan-title">FREE</h3>
              <p className="plan-description">Perfect for getting started with your cricket profile</p>
              <div className="plan-price">
                <span className="price">Rs. 0</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Basic Profile Creation</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Upload Highlight Videos</span>
                </li>
                <li className="feature-excluded">
                  <span className="material-icons">cancel</span>
                  <span>Direct Scout Messaging</span>
                </li>
                <li className="feature-excluded">
                  <span className="material-icons">cancel</span>
                  <span>Coach Mentorship</span>
                </li>
                <li className="feature-excluded">
                  <span className="material-icons">cancel</span>
                  <span>Priority Support</span>
                </li>
              </ul>
              <Link to="/signin" className="plan-btn free-btn">Get Started</Link>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card premium-plan">
              <div className="popular-badge">
                <span className="material-icons">star</span>
                MOST POPULAR
              </div>
              <h3 className="plan-title">PREMIUM</h3>
              <p className="plan-description">Ultimate package with exclusive coach mentorship access</p>
              <div className="plan-price">
                <span className="price">Rs. 3,299</span>
                <span className="period">/month</span>
              </div>
              <ul className="plan-features">
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Everything in Free</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Direct Scout Messaging</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Verified Coach Mentorship</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Personalized Feedback</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>Training Tips & Insights</span>
                </li>
                <li className="feature-included">
                  <span className="material-icons">check_circle</span>
                  <span>24/7 Priority Support</span>
                </li>
              </ul>
              <Link to="/signin" className="plan-btn premium-btn">Get Premium</Link>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  );
}
