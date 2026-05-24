import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../styles/admin-opportunities.css';

export default function AdminOpportunities({ user, onLogout }) {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOpportunities();
  }, [filter]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://scoutbookfyp1.onrender.com/api/admin/opportunities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      const data = await response.json();
      setOpportunities(data);
    } catch (err) {
      console.error('Error loading opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const response = await fetch(`https://scoutbookfyp1.onrender.com/api/admin/opportunities/${opportunityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });

      if (response.ok) {
        alert('Opportunity deleted successfully');
        loadOpportunities();
      } else {
        alert('Failed to delete opportunity');
      }
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      alert('Error deleting opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && opp.opportunity_type === filter;
  });

  const totalOpportunities = opportunities.length;
  const contractCount = opportunities.filter(o => o.opportunity_type === 'contract').length;
  const trialCount = opportunities.filter(o => o.opportunity_type === 'trial').length;
  const scholarshipCount = opportunities.filter(o => o.opportunity_type === 'scholarship').length;

  return (
    <div className="admin-layout-with-sidebar">
      <AdminSidebar user={user} onLogout={onLogout} />
      <div className="dashboard-main-content">
        <div className="admin-opportunities-container">
          <div className="admin-page-header">
            <div>
              <h1>Opportunity Management</h1>
              <p>Manage all opportunities on the platform</p>
            </div>
          </div>

          {/* Stats */}
          <div className="opportunity-stats">
            <div className="stat-card all">
              <div className="stat-icon">
                <span className="material-icons">work</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalOpportunities}</div>
                <div className="stat-label">Total Opportunities</div>
              </div>
            </div>
            <div className="stat-card contract">
              <div className="stat-icon">
                <span className="material-icons">description</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{contractCount}</div>
                <div className="stat-label">Contracts</div>
              </div>
            </div>
            <div className="stat-card trial">
              <div className="stat-icon">
                <span className="material-icons">sports</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{trialCount}</div>
                <div className="stat-label">Trials</div>
              </div>
            </div>
            <div className="stat-card scholarship">
              <div className="stat-icon">
                <span className="material-icons">school</span>
              </div>
              <div className="stat-info">
                <div className="stat-value">{scholarshipCount}</div>
                <div className="stat-label">Scholarships</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="admin-filters">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Opportunities
              </button>
              <button
                className={`filter-btn ${filter === 'contract' ? 'active' : ''}`}
                onClick={() => setFilter('contract')}
              >
                Contracts
              </button>
              <button
                className={`filter-btn ${filter === 'trial' ? 'active' : ''}`}
                onClick={() => setFilter('trial')}
              >
                Trials
              </button>
              <button
                className={`filter-btn ${filter === 'scholarship' ? 'active' : ''}`}
                onClick={() => setFilter('scholarship')}
              >
                Scholarships
              </button>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Opportunities Table */}
          <div className="admin-table-card">
            {loading ? (
              <div className="loading-state">Loading opportunities...</div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="empty-state">No opportunities found</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Posted By</th>
                    <th>Applications</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map((opp) => (
                    <tr key={opp.id}>
                      <td>
                        <div className="opportunity-title-cell">
                          <span className="material-icons opp-icon">work</span>
                          <span className="opp-title">{opp.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${opp.opportunity_type}`}>
                          {opp.opportunity_type}
                        </span>
                      </td>
                      <td>
                        <div className="location-cell">
                          <span className="material-icons location-icon">location_on</span>
                          {opp.location}
                        </div>
                      </td>
                      <td>{opp.scout_name || 'Unknown'}</td>
                      <td>{opp.application_count || 0}</td>
                      <td>{new Date(opp.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => navigate(`/opportunities/${opp.id}`)}
                            title="View Details"
                          >
                            <span className="material-icons">visibility</span>
                          </button>
                          <button
                            className="btn-icon delete"
                            onClick={() => handleDeleteOpportunity(opp.id)}
                            title="Delete Opportunity"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
