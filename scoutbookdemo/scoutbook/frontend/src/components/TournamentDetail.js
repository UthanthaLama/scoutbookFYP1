import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tournamentsAPI } from '../services/api';
import '../styles/tournament-detail.css';

export default function TournamentDetail({ user }) {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const [formData, setFormData] = useState({
    team_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    team_size: '',
    additional_info: ''
  });

  useEffect(() => {
    loadTournamentDetails();
    loadRegistrations();
    checkIfRegistered();
  }, [id]);

  const loadTournamentDetails = async () => {
    try {
      setLoading(true);
      const data = await tournamentsAPI.getById(id);
      setTournament(data);
    } catch (err) {
      setError('Failed to load tournament details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async () => {
    try {
      const data = await tournamentsAPI.getRegistrations(id);
      setRegistrations(data);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }
  };

  const checkIfRegistered = async () => {
    try {
      const myRegistrations = await tournamentsAPI.getMyRegistrations();
      const registered = myRegistrations.some(reg => reg.tournament_id === parseInt(id));
      setAlreadyRegistered(registered);
    } catch (err) {
      console.error('Error checking registration:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setRegistering(true);

    try {
      await tournamentsAPI.register(id, formData);
      alert('Team registered successfully!');
      setShowRegisterModal(false);
      setAlreadyRegistered(true);
      loadRegistrations();
      // Reset form
      setFormData({
        team_name: '',
        contact_email: user?.email || '',
        contact_phone: '',
        team_size: '',
        additional_info: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register team');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRegistrationOpen = () => {
    if (!tournament) return false;
    if (tournament.registration_deadline) {
      return new Date(tournament.registration_deadline) > new Date();
    }
    return new Date(tournament.start_date) > new Date();
  };

  const isTournamentFull = () => {
    if (!tournament || !tournament.max_teams) return false;
    return registrations.length >= tournament.max_teams;
  };

  const canRegister = () => {
    return !alreadyRegistered && isRegistrationOpen() && !isTournamentFull();
  };

  if (loading) {
    return (
      <div className="tournament-detail-wrapper">
        <div className="loading-container">Loading tournament details...</div>
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="tournament-detail-wrapper">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="tournament-detail-wrapper">
      <div className="tournament-detail-container">
        <div className="tournament-detail-card">
          {/* Header */}
          <div className="tournament-detail-header">
            <div>
              <div className="badges">
                <span className="format-badge">{tournament.tournament_format}</span>
                <span className="status-badge">{tournament.status}</span>
              </div>
              <h1>{tournament.title}</h1>
              <p className="organizer-info">Organized by {tournament.organizer_name}</p>
            </div>
          </div>

          <div className="tournament-content">
            <section className="detail-section">
              <h3>Description</h3>
              <p>{tournament.description}</p>
            </section>

            <section className="detail-section">
              <h3>Details</h3>
              <div className="details-grid">
                {tournament.location && (
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{tournament.location}</span>
                  </div>
                )}
                {tournament.start_date && (
                  <div className="detail-row">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{formatDate(tournament.start_date)}</span>
                  </div>
                )}
                {tournament.end_date && (
                  <div className="detail-row">
                    <span className="detail-label">End Date:</span>
                    <span className="detail-value">{formatDate(tournament.end_date)}</span>
                  </div>
                )}
                {tournament.registration_deadline && (
                  <div className="detail-row">
                    <span className="detail-label">Registration Deadline:</span>
                    <span className="detail-value">{formatDate(tournament.registration_deadline)}</span>
                  </div>
                )}
                {tournament.tournament_format && (
                  <div className="detail-row">
                    <span className="detail-label">Format:</span>
                    <span className="detail-value">{tournament.tournament_format}</span>
                  </div>
                )}
              </div>
            </section>

            {tournament.prize_details && (
              <section className="detail-section">
                <h3>Prizes</h3>
                <p>{tournament.prize_details}</p>
              </section>
            )}

            {tournament.rules && (
              <section className="detail-section">
                <h3>Rules & Regulations</h3>
                <p>{tournament.rules}</p>
              </section>
            )}

            {tournament.contact_info && (
              <section className="detail-section contact-section">
                <h3>Contact Information</h3>
                <p>{tournament.contact_info}</p>
              </section>
            )}

            {tournament.max_teams && (
              <section className="detail-section">
                <h3>Registration Information</h3>
                <div className="details-grid">
                  <div className="detail-row">
                    <span className="detail-label">Teams Registered:</span>
                    <span className="detail-value">{registrations.length} / {tournament.max_teams}</span>
                  </div>
                  {tournament.entry_fee && (
                    <div className="detail-row">
                      <span className="detail-label">Entry Fee:</span>
                      <span className="detail-value">{tournament.entry_fee}</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {canRegister() && (
          <div className="registration-button-card">
            <h2>Ready to Register?</h2>
            <p>Register your team for this tournament</p>
            <button
              className="btn-register-full"
              onClick={() => setShowRegisterModal(true)}
            >
              Register Your Team
            </button>
          </div>
        )}

        {alreadyRegistered && (
          <div className="already-registered-notice">
            <p>✓ You have already registered for this tournament</p>
          </div>
        )}

        {!isRegistrationOpen() && (
          <div className="registration-closed-notice">
            <p>⏰ Registration for this tournament has closed</p>
          </div>
        )}

        {isTournamentFull() && (
          <div className="tournament-full-notice">
            <p>🏟️ This tournament has reached maximum capacity</p>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Register Your Team</h2>
            <p>Fill in the details to register for {tournament.title}</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleRegister} className="registration-form">
              <div className="form-group">
                <label>Team Name *</label>
                <input
                  type="text"
                  name="team_name"
                  value={formData.team_name}
                  onChange={handleChange}
                  placeholder="Enter your team name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+977 9800000000"
                />
              </div>

              <div className="form-group">
                <label>Team Size</label>
                <input
                  type="number"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleChange}
                  placeholder="Number of players"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Additional Information</label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleChange}
                  placeholder="Any additional information about your team..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={registering}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={registering}
                >
                  {registering ? 'Registering...' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
