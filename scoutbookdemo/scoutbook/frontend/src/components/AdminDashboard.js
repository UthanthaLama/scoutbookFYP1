import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../styles/admin-dashboard.css';

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalScouts: 0,
    totalOpportunities: 0,
    totalApplications: 0,
    totalTournaments: 0,
    activeUsers: 0,
    newUsersThisMonth: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://scoutbookfyp1.onrender.com/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.recentUsers) {
        setRecentUsers(data.recentUsers);
      }
      if (data.recentOpportunities) {
        setRecentOpportunities(data.recentOpportunities);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout-with-sidebar">
      <AdminSidebar user={user} onLogout={onLogout} />
      <div className="dashboard-main-content">
        <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage and monitor your ScoutBook platform</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid - 4 Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-card-header">
                  <div className="stat-card-icon">
                    <span className="material-icons">group</span>
                  </div>
                  <span className="stat-card-title">Total Users</span>
                </div>
                <div className="stat-card-value">{stats.totalUsers}</div>
                <div className="stat-card-change">+{stats.newUsersThisMonth} this month</div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-card-header">
                  <div className="stat-card-icon">
                    <span className="material-icons">sports_cricket</span>
                  </div>
                  <span className="stat-card-title">Total Players</span>
                </div>
                <div className="stat-card-value">{stats.totalPlayers}</div>
                <div className="stat-card-change">Active players</div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-card-header">
                  <div className="stat-card-icon">
                    <span className="material-icons">search</span>
                  </div>
                  <span className="stat-card-title">Total Scouts</span>
                </div>
                <div className="stat-card-value">{stats.totalScouts}</div>
                <div className="stat-card-change">Active scouts</div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-card-header">
                  <div className="stat-card-icon">
                    <span className="material-icons">work</span>
                  </div>
                  <span className="stat-card-title">Total Opportunities</span>
                </div>
                <div className="stat-card-value">{stats.totalOpportunities}</div>
                <div className="stat-card-change">{stats.totalApplications} applications</div>
              </div>
            </div>

            {/* Content Grid - 2 Columns */}
            <div className="admin-content-grid">
              {/* Recent Users */}
              <div className="admin-section-card">
                <div className="section-card-header">
                  <h2>Recent Users</h2>
                  <button className="btn-admin-secondary" onClick={() => navigate('/admin/users')}>
                    View All
                  </button>
                </div>
                {recentUsers.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-icons">group</span>
                    <h3>No Users Yet</h3>
                    <p>Users will appear here once they register</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.slice(0, 5).map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {user.profile_picture ? (
                                  <img 
                                    src={user.profile_picture} 
                                    alt={user.name}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    background: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#a3e635',
                                    fontWeight: '600'
                                  }}>
                                    {user.name?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: '600' }}>{user.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${user.role}`}>
                                <span className="status-badge-dot"></span>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className="status-badge active">
                                <span className="status-badge-dot"></span>
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Opportunities */}
              <div className="admin-section-card">
                <div className="section-card-header">
                  <h2>Recent Opportunities</h2>
                  <button className="btn-admin-secondary" onClick={() => navigate('/admin/opportunities')}>
                    View All
                  </button>
                </div>
                {recentOpportunities.length === 0 ? (
                  <div className="empty-state">
                    <span className="material-icons">work</span>
                    <h3>No Opportunities Yet</h3>
                    <p>Opportunities will appear here once created</p>
                  </div>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Apps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOpportunities.slice(0, 5).map((opp) => (
                          <tr key={opp.id}>
                            <td>
                              <div>
                                <div style={{ fontWeight: '600' }}>{opp.title}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                  <span className="material-icons" style={{ fontSize: '0.75rem', verticalAlign: 'middle' }}>location_on</span>
                                  {opp.location}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="status-badge pending">
                                {opp.opportunity_type}
                              </span>
                            </td>
                            <td>{opp.application_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Data Table */}
            <div className="admin-section-card">
              <div className="section-card-header">
                <h2>All Users Overview</h2>
                <div className="section-card-actions">
                  <button className="btn-admin-secondary">
                    <span className="material-icons" style={{ fontSize: '1rem', marginRight: '0.25rem' }}>filter_list</span>
                    Filter
                  </button>
                  <button className="btn-admin-primary">
                    <span className="material-icons" style={{ fontSize: '1rem', marginRight: '0.25rem' }}>download</span>
                    Export
                  </button>
                </div>
              </div>
              {recentUsers.length === 0 ? (
                <div className="empty-state">
                  <span className="material-icons">inbox</span>
                  <h3>No Data Available</h3>
                  <p>User data will appear here</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {user.profile_picture ? (
                                <img 
                                  src={user.profile_picture} 
                                  alt={user.name}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                />
                              ) : (
                                <div style={{ 
                                  width: '32px', 
                                  height: '32px', 
                                  borderRadius: '50%', 
                                  background: '#334155',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#a3e635',
                                  fontWeight: '600'
                                }}>
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span style={{ fontWeight: '600' }}>{user.name}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`status-badge ${user.role}`}>
                              <span className="status-badge-dot"></span>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge active">
                              <span className="status-badge-dot"></span>
                              Active
                            </span>
                          </td>
                          <td>
                            <button className="btn-icon" title="View Details">
                              <span className="material-icons">visibility</span>
                            </button>
                            <button className="btn-icon" title="Edit">
                              <span className="material-icons">edit</span>
                            </button>
                            <button className="btn-icon" title="Delete">
                              <span className="material-icons">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
