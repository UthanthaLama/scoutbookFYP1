import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import '../styles/search-players.css';

export default function SearchPlayers({ user }) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    position: []
  });

  useEffect(() => {
    searchPlayers();
  }, []);

  const searchPlayers = async () => {
    try {
      setLoading(true);
      const activeFilters = {};
      if (filters.position.length > 0) {
        activeFilters.position = filters.position[0];
      }
      if (searchQuery.trim()) {
        activeFilters.search = searchQuery.trim();
      }
      const data = await profileAPI.searchPlayers(activeFilters);
      setPlayers(data);
    } catch (error) {
      console.error('Error searching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role) => {
    setFilters(prev => {
      const newPosition = prev.position.includes(role)
        ? prev.position.filter(r => r !== role)
        : [role];
      return { ...prev, position: newPosition };
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchPlayers();
  };

  useEffect(() => {
    searchPlayers();
  }, [filters]);

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  return (
    <div className="search-players-modern">
      <div className="search-players-header">
        <h1>Discover Players</h1>
        <p>Explore talented cricket players and connect with the next generation of champions</p>
      </div>

      <div className="search-players-layout">
        {/* Sidebar Filters */}
        <aside className="search-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <span className="material-icons">tune</span>
          </div>

          <div className="filter-section">
            <div className="filter-title">
              <span>Role</span>
              <span className="material-icons">expand_less</span>
            </div>
            <div className="filter-options">
              {['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'].map(role => (
                <label key={role} className="filter-checkbox">
                  <span>{role}</span>
                  <input
                    type="checkbox"
                    checked={filters.position.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Players Grid */}
        <div className="search-players-content">
          {/* Search Bar Above Cards */}
          <form className="search-action-bar" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="material-icons search-icon">search</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {loading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="search-empty">
              <span className="material-icons">search_off</span>
              <h3>No players found</h3>
              <p>Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <>
              <div className="players-grid-modern">
                {players.map((player) => (
                  <div key={player.user_id} className="player-card-modern">
                    <div className="player-card-image">
                      {player.profile_picture ? (
                        <img src={player.profile_picture} alt={player.full_name || player.name} />
                      ) : (
                        <div className="player-image-placeholder">
                          <span className="material-icons">person</span>
                        </div>
                      )}
                      {player.location && (
                        <div className="player-location-badge">
                          <span>{player.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="player-card-content">
                      <div className="player-card-header">
                        <h3>{player.full_name || player.name}</h3>
                        {player.verified && (
                          <span className="material-icons verified-icon">verified</span>
                        )}
                      </div>

                      <div className="player-card-details">
                        {player.position && (
                          <div className="player-detail-row">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">{player.position}</span>
                          </div>
                        )}
                        {player.batting_style && (
                          <div className="player-detail-row">
                            <span className="detail-label">Batting:</span>
                            <span className="detail-value">{player.batting_style}</span>
                          </div>
                        )}
                        {player.bowling_style && (
                          <div className="player-detail-row">
                            <span className="detail-label">Bowling:</span>
                            <span className="detail-value">{player.bowling_style}</span>
                          </div>
                        )}
                      </div>

                      <button 
                        className="btn-view-profile-modern"
                        onClick={() => navigate(`/profile/${player.user_id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Players Button */}
              {players.length > 6 && (
                <div className="view-all-container">
                  <button className="btn-view-all-players">
                    View All Players
                    <span className="material-icons">trending_flat</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
