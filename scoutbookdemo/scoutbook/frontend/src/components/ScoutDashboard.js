import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI, tournamentsAPI } from '../services/api';
import PaymentGateway from './PaymentGateway';
import '../styles/scout-dashboard.css';

export default function ScoutDashboard({ user }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingTournaments, setLoadingTournaments] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stats] = useState({
    opportunitiesPosted: 8,
    applicationsReceived: 45,
    playersViewed: 120,
    shortlisted: 15
  });

  useEffect(() => {
    loadProfile();
    loadTournaments();
    loadTopPlayers();
    checkVerifiedStatus();

    // Listen for user updates after payment
    window.addEventListener('userUpdated', checkVerifiedStatus);
    return () => window.removeEventListener('userUpdated', checkVerifiedStatus);
  }, []);

  const checkVerifiedStatus = async () => {
    try {
      const response = await fetch('/api/payments/subscription/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIsVerified(data.subscriptions && data.subscriptions.length > 0);
      }
    } catch (error) {
      console.error('Error checking verified status:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoadingTournaments(true);
      const data = await tournamentsAPI.getAll();
      // Get upcoming tournaments (next 2)
      const upcoming = data.filter(t => new Date(t.start_date) > new Date()).slice(0, 2);
      setTournaments(upcoming);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoadingTournaments(false);
    }
  };

  const loadTopPlayers = async () => {
    try {
      setLoadingPlayers(true);
      const data = await profileAPI.searchPlayers({});
      // Get only top 4 players for display
      setPlayers(data.slice(0, 4));
    } catch (err) {
      console.error('Error loading players:', err);
    } finally {
      setLoadingPlayers(false);
    }
  };

  const displayName = profile?.full_name || user.name || user.email.split('@')[0];

  return (
    <div className="scout-dashboard">
      {/* Hero Section - Full Width */}
      <section className="scout-hero">
        <div className="scout-hero-overlay">
          <div className="scout-hero-content">
            <div className="scout-hero-badge">
              <svg className="scout-hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              <span>Scout Dashboard 2024</span>
            </div>
            <h1 className="scout-hero-title">
              Elite Talent<br/>Discovery
            </h1>
            <p className="scout-hero-subtitle">
              {isVerified && (
                <div className="verified-indicator-inline">
                  <span className="material-icons">verified</span>
                  <span>Verified Scout - Access premium player database</span>
                </div>
              )}
              Connect with the next generation of cricket stars and build championship teams with our data-driven scouting engine.
            </p>
            <div className="scout-hero-actions">
              <button className="scout-btn scout-btn-primary" onClick={() => navigate('/search-players')}>
                Explore Talent Pool
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats and Recent Activity - Side by Side */}
      <div className="scout-stats-activity-container">
        {/* Stats Card */}
        <div className="scout-stats-card">
          <div className="scout-stats-header">
            <div className="scout-stats-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
            </div>
            <h3>Your Activity</h3>
          </div>
          <div className="scout-stats-grid">
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.opportunitiesPosted}</span>
              <span className="scout-stat-label">Opportunities Posted</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.applicationsReceived}</span>
              <span className="scout-stat-label">Applications</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.playersViewed}</span>
              <span className="scout-stat-label">Players Viewed</span>
            </div>
            <div className="scout-stat-item">
              <span className="scout-stat-value">{stats.shortlisted}</span>
              <span className="scout-stat-label">Shortlisted</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="scout-activity-card">
          <h3>Recent Activity</h3>
          <div className="scout-activity-list">
            <div className="scout-activity-item">
              <div className="scout-activity-dot scout-dot-success"></div>
              <div className="scout-activity-content">
                <p><strong>New application</strong> received for Cricket Trial</p>
                <span className="scout-activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="scout-activity-item">
              <div className="scout-activity-dot scout-dot-info"></div>
              <div className="scout-activity-content">
                <p><strong>Tournament registration</strong> deadline approaching</p>
                <span className="scout-activity-time">1 day ago</span>
              </div>
            </div>
            <div className="scout-activity-item">
              <div className="scout-activity-dot scout-dot-warning"></div>
              <div className="scout-activity-content">
                <p><strong>Profile views</strong> increased by 25%</p>
                <span className="scout-activity-time">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="scout-content">
        <div className="scout-grid">
          {/* Main Section */}
          <div className="scout-main">
            {/* Most Searched Players with Premium Feature */}
            <div className="scout-players-section-wrapper">
              {/* Players Section */}
              <div className="scout-section scout-players-main">
                <div className="scout-section-header">
                  <div>
                    <h2 className="scout-section-title">Most Searched Players</h2>
                    <p className="scout-section-subtitle">Discover top talent in the cricket community</p>
                  </div>
                  <button className="scout-btn scout-btn-outline" onClick={() => navigate('/search-players')}>
                    View All Players
                  </button>
                </div>
                
                {loadingPlayers ? (
                  <div className="scout-loading">
                    <div className="scout-spinner"></div>
                    <p>Loading players...</p>
                  </div>
                ) : players.length === 0 ? (
                  <div className="scout-empty-state">
                    <div className="scout-empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <h3>No Players Found</h3>
                    <p>Check back later to discover talented cricket players</p>
                    <button className="scout-btn scout-btn-primary" onClick={() => navigate('/search-players')}>
                      Search Players
                    </button>
                  </div>
                ) : (
                  <div className="scout-players-grid">
                    {players.map((player) => (
                      <div key={player.user_id} className="scout-player-card" onClick={() => navigate(`/profile/${player.user_id}`)}>
                        <div className="scout-player-card-image">
                          {player.profile_picture ? (
                            <img src={player.profile_picture} alt={player.full_name || player.name} />
                          ) : (
                            <div className="scout-player-image-placeholder">
                              <span className="material-icons">person</span>
                            </div>
                          )}
                          {player.location && (
                            <div className="scout-player-location-badge">
                              <span>{player.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="scout-player-card-content">
                          <div className="scout-player-card-header">
                            <h3 className="scout-player-name">{player.full_name || player.name || 'Unknown Player'}</h3>
                            {player.verified && (
                              <span className="material-icons scout-verified-icon">verified</span>
                            )}
                          </div>

                          <div className="scout-player-card-details">
                            {player.position && (
                              <div className="scout-player-detail-row">
                                <span className="scout-detail-label">Role:</span>
                                <span className="scout-detail-value">{player.position}</span>
                              </div>
                            )}
                            {player.batting_style && (
                              <div className="scout-player-detail-row">
                                <span className="scout-detail-label">Batting:</span>
                                <span className="scout-detail-value">{player.batting_style}</span>
                              </div>
                            )}
                            {player.bowling_style && (
                              <div className="scout-player-detail-row">
                                <span className="scout-detail-label">Bowling:</span>
                                <span className="scout-detail-value">{player.bowling_style}</span>
                              </div>
                            )}
                          </div>

                          <button 
                            className="scout-btn-view-profile"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${player.user_id}`);
                            }}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Premium Feature Card */}
              <div className="scout-premium-sidebar">
                <div className="scout-premium-card">
                  <div className="scout-premium-badge">
                    <span className="material-icons">verified</span>
                    GET VERIFIED
                  </div>
                  <div className="scout-premium-icon">
                    <span className="material-icons">verified_user</span>
                  </div>
                  <h3>Become a Verified Scout</h3>
                  <p>Stand out with a verified badge and gain players' trust instantly</p>
                  <ul className="scout-premium-features">
                    <li>
                      <span className="material-icons">check_circle</span>
                      <span>Official verified badge</span>
                    </li>
                    <li>
                      <span className="material-icons">check_circle</span>
                      <span>Priority listing</span>
                    </li>
                    <li>
                      <span className="material-icons">check_circle</span>
                      <span>Enhanced credibility</span>
                    </li>
                    <li>
                      <span className="material-icons">check_circle</span>
                      <span>Premium analytics</span>
                    </li>
                  </ul>
                  <div className="scout-premium-price">
                    <span className="scout-price-amount">Rs. 3,299</span>
                    <span className="scout-price-period">/month</span>
                  </div>
                  <button className="scout-btn scout-btn-premium" onClick={() => setShowPaymentGateway(true)}>
                    Get Verified
                  </button>
                </div>
              </div>
            </div>

            {/* Tournaments Section */}
            <div className="scout-section">
              <div className="scout-section-header">
                <div>
                  <h2 className="scout-section-title">Upcoming Tournaments</h2>
                  <p className="scout-section-subtitle">Discover new talent at these events</p>
                </div>
                <button className="scout-btn scout-btn-outline" onClick={() => navigate('/tournaments')}>
                  View All
                </button>
              </div>

              {loadingTournaments ? (
                <div className="scout-loading">
                  <div className="scout-spinner"></div>
                  <p>Loading tournaments...</p>
                </div>
              ) : tournaments.length === 0 ? (
                <div className="scout-empty-state">
                  <div className="scout-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                  </div>
                  <h3>No Upcoming Tournaments</h3>
                  <p>Check back later for new tournament opportunities</p>
                  <button className="scout-btn scout-btn-primary" onClick={() => navigate('/tournaments')}>
                    Browse All Tournaments
                  </button>
                </div>
              ) : (
                <div className="scout-tournaments-grid">
                  {tournaments.map((tournament) => (
                    <div key={tournament.id} className="scout-tournament-card" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                      <div className="scout-tournament-header">
                        <span className="scout-tournament-badge">
                          {tournament.sport}
                        </span>
                        <span className="scout-tournament-date">
                          {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="scout-tournament-body">
                        <h3 className="scout-tournament-title">{tournament.name}</h3>
                        <div className="scout-tournament-meta">
                          <span className="scout-tournament-location">
                            <svg className="scout-location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {tournament.location}
                          </span>
                          <span className="scout-tournament-level">
                            <svg className="scout-target-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <circle cx="12" cy="12" r="6"/>
                              <circle cx="12" cy="12" r="2"/>
                            </svg>
                            {tournament.level || 'All Levels'}
                          </span>
                        </div>
                        {tournament.description && (
                          <p className="scout-tournament-desc">{tournament.description.substring(0, 100)}...</p>
                        )}
                      </div>
                      
                      <div className="scout-tournament-footer">
                        <div className="scout-tournament-stats">
                          <span className="scout-tournament-stat">
                            <strong>{tournament.registration_count || 0}</strong> Registered
                          </span>
                        </div>
                        <button className="scout-tournament-btn">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentGateway 
        isOpen={showPaymentGateway}
        onClose={() => setShowPaymentGateway(false)}
        plan="Verified Scout"
        amount="3,299"
      />
    </div>
  );
}
