import { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import '../styles/admin-tournaments.css';

// SVG Icons
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default function AdminTournaments({ user, onLogout }) {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://scoutbookfyp1.onrender.com/api/tournaments/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      const data = await response.json();
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tournamentId) => {
    if (!window.confirm('Are you sure you want to approve this tournament?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`https://scoutbookfyp1.onrender.com/api/tournaments/${tournamentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });

      if (response.ok) {
        alert('Tournament approved successfully!');
        loadTournaments();
      } else {
        alert('Failed to approve tournament');
      }
    } catch (err) {
      console.error('Error approving tournament:', err);
      alert('Error approving tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`https://scoutbookfyp1.onrender.com/api/tournaments/${selectedTournament.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (response.ok) {
        alert('Tournament rejected');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedTournament(null);
        loadTournaments();
      } else {
        alert('Failed to reject tournament');
      }
    } catch (err) {
      console.error('Error rejecting tournament:', err);
      alert('Error rejecting tournament');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (tournament) => {
    setSelectedTournament(tournament);
    setShowRejectModal(true);
  };

  const openDetailsModal = (tournament) => {
    setSelectedTournament(tournament);
    setShowDetailsModal(true);
  };

  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'all') return true;
    return t.verification_status === filter;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending Review', class: 'status-pending' },
      approved: { label: 'Approved', class: 'status-approved' },
      rejected: { label: 'Rejected', class: 'status-rejected' }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const pendingCount = tournaments.filter(t => t.verification_status === 'pending').length;
  const approvedCount = tournaments.filter(t => t.verification_status === 'approved').length;
  const rejectedCount = tournaments.filter(t => t.verification_status === 'rejected').length;

  return (
    <div className="admin-layout-with-sidebar">
      <AdminSidebar user={user} onLogout={onLogout} />
      <div className="dashboard-main-content">
        <div className="admin-tournaments-container">
          <div className="admin-tournaments-header">
            <h1>Tournament Management</h1>
            <p>Review and manage tournament submissions from the platform participants.</p>
          </div>

          {/* Stats */}
          <div className="tournament-stats">
            <div className="stat-card pending">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Pending Review</p>
                  <h3 className="stat-value">{pendingCount}</h3>
                </div>
                <div className="stat-icon pending-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Approved</p>
                  <h3 className="stat-value">{approvedCount}</h3>
                </div>
                <div className="stat-icon approved-icon">
                  <CheckIcon />
                </div>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-label">Rejected</p>
                  <h3 className="stat-value">{rejectedCount}</h3>
                </div>
                <div className="stat-icon rejected-icon">
                  <XIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="tournament-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({tournaments.length})
            </button>
            <button
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({approvedCount})
            </button>
            <button
              className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          {/* Tournaments List */}
          {loading ? (
            <div className="loading-state">Loading tournaments...</div>
          ) : filteredTournaments.length === 0 ? (
            <div className="empty-state">
              <p>No tournaments found</p>
            </div>
          ) : (
            <div className="tournaments-list">
              {filteredTournaments.map((tournament) => {
                const statusBadge = getStatusBadge(tournament.verification_status);
                return (
                  <div key={tournament.id} className="tournament-item">
                    <button 
                      className="tournament-close-btn"
                      title="Remove Tournament"
                      onClick={(e) => {
                        const card = e.target.closest('.tournament-item');
                        card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                        card.style.transform = 'scale(0.95)';
                        card.style.opacity = '0';
                        setTimeout(() => card.remove(), 400);
                      }}
                    >
                      <XIcon />
                    </button>
                    <div className="tournament-main">
                      <div className="tournament-info">
                        <div className="tournament-title-row">
                          <h4>{tournament.title}</h4>
                          <span className={`status-badge ${statusBadge.class}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <p className="tournament-description">{tournament.description}</p>
                      </div>
                    </div>
                    <div className="tournament-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Format</span>
                        <span className="detail-value">{tournament.tournament_format}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <div className="detail-value-with-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          <span>{tournament.location}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Start Date</span>
                        <div className="detail-value-with-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{formatDate(tournament.start_date)}</span>
                        </div>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Organizer</span>
                        <div className="detail-value-with-icon">
                          <span className="organizer-avatar">{tournament.organizer_name?.charAt(0).toUpperCase()}</span>
                          <span>({tournament.organizer_role})</span>
                        </div>
                      </div>
                    </div>
                    {tournament.rejection_reason && (
                      <div className="rejection-reason">
                        <strong>Rejection Reason:</strong> {tournament.rejection_reason}
                      </div>
                    )}
                    <div className="tournament-actions-footer">
                      <button
                        className="btn-view-details"
                        onClick={() => openDetailsModal(tournament)}
                      >
                        <EyeIcon />
                        View Details
                      </button>
                      {tournament.verification_status === 'pending' && (
                        <>
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(tournament.id)}
                            disabled={actionLoading}
                          >
                            <CheckIcon />
                            Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => openRejectModal(tournament)}
                            disabled={actionLoading}
                          >
                            <XIcon />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedTournament && (
          <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
            <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                <XIcon />
              </button>
              <h2>{selectedTournament.title}</h2>
              <div className="details-content">
                <div className="detail-section">
                  <h3>Description</h3>
                  <p>{selectedTournament.description}</p>
                </div>
                <div className="detail-section">
                  <h3>Tournament Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Format:</span>
                      <span className="info-value">{selectedTournament.tournament_format}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Location:</span>
                      <span className="info-value">{selectedTournament.location}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Start Date:</span>
                      <span className="info-value">{formatDate(selectedTournament.start_date)}</span>
                    </div>
                    {selectedTournament.end_date && (
                      <div className="info-item">
                        <span className="info-label">End Date:</span>
                        <span className="info-value">{formatDate(selectedTournament.end_date)}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className="info-label">Max Teams:</span>
                      <span className="info-value">{selectedTournament.max_teams || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Entry Fee:</span>
                      <span className="info-value">{selectedTournament.entry_fee || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                {selectedTournament.prize_details && (
                  <div className="detail-section">
                    <h3>Prize Details</h3>
                    <p>{selectedTournament.prize_details}</p>
                  </div>
                )}
                {selectedTournament.rules && (
                  <div className="detail-section">
                    <h3>Rules & Regulations</h3>
                    <p>{selectedTournament.rules}</p>
                  </div>
                )}
                {selectedTournament.contact_info && (
                  <div className="detail-section">
                    <h3>Contact Information</h3>
                    <p>{selectedTournament.contact_info}</p>
                  </div>
                )}
                <div className="detail-section">
                  <h3>Organizer Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{selectedTournament.organizer_name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Role:</span>
                      <span className="info-value">{selectedTournament.organizer_role}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reject Tournament</h2>
              <p>Please provide a reason for rejecting "{selectedTournament?.title}"</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                autoFocus
              />
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-reject"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
