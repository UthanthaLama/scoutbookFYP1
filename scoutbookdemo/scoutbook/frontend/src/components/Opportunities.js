import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { opportunitiesAPI } from '../services/api';
import '../styles/opportunities.css';

export default function Opportunities({ user }) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadOpportunities();
  }, [filter]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesAPI.getAll(filter ? { opportunity_type: filter } : {});
      setOpportunities(data);
    } catch (err) {
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="opportunities-wrapper">
      <div className="opportunities-container">
      <div className="opportunities-header">
        <h1>Browse Opportunities</h1>
        <p>Find trials, training programs, scholarships, and contracts</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="opportunities-filters">
        <button
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'trial' ? 'active' : ''}`}
          onClick={() => setFilter('trial')}
        >
          Trials
        </button>
        <button
          className={`filter-btn ${filter === 'training' ? 'active' : ''}`}
          onClick={() => setFilter('training')}
        >
          Training
        </button>
        <button
          className={`filter-btn ${filter === 'scholarship' ? 'active' : ''}`}
          onClick={() => setFilter('scholarship')}
        >
          Scholarships
        </button>
        <button
          className={`filter-btn ${filter === 'contract' ? 'active' : ''}`}
          onClick={() => setFilter('contract')}
        >
          Contracts
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading opportunities...</div>
      ) : opportunities.length === 0 ? (
        <div className="empty-state">
          <p>No opportunities available at the moment.</p>
          <p>Check back soon!</p>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <div key={opp.id} className="opportunity-card">
              <div className="card-header">
                <div className="opportunity-type-badge">{opp.opportunity_type}</div>
                {opp.application_count && (
                  <div className="applications-badge">{opp.application_count} APPLICATIONS</div>
                )}
              </div>

              <h3 className="card-title">{opp.title}</h3>

              <div className="card-details">
                {opp.location && (
                  <div className="detail-row">
                    <span className="detail-label">LOCATION:</span>
                    <span className="detail-value">{opp.location}</span>
                  </div>
                )}
                {opp.created_at && (
                  <div className="detail-row">
                    <span className="detail-label">POSTED:</span>
                    <span className="detail-value">{formatDate(opp.created_at)}</span>
                  </div>
                )}
                {opp.deadline && (
                  <div className="detail-row">
                    <span className="detail-label">DEADLINE:</span>
                    <span className="detail-value">{formatDate(opp.deadline)}</span>
                  </div>
                )}
                {opp.position && (
                  <div className="detail-row">
                    <span className="detail-label">POSITION:</span>
                    <span className="detail-value">{opp.position}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="btn-view"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
