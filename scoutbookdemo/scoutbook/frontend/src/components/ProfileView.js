import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { profileAPI } from '../services/api';
import VideoManager from './VideoManager';
import '../styles/profile-view.css';

export default function ProfileView({ user }) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(user?.role === 'scout' ? 'personal' : 'basic');
  const isOwnProfile = !userId || parseInt(userId) === user.id;

  useEffect(() => {
    loadProfile();
    
    // Track profile view if viewing another user's profile
    if (userId && parseInt(userId) !== user.id) {
      const viewKey = `profile_view_${userId}`;
      const hasViewed = sessionStorage.getItem(viewKey);
      
      if (!hasViewed) {
        trackProfileView();
        sessionStorage.setItem(viewKey, 'true');
      }
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      let profileData;
      if (userId) {
        // Load another user's profile
        profileData = await profileAPI.getProfileById(userId);
      } else {
        // Load current user's profile
        profileData = await profileAPI.getProfile();
      }
      setProfile(profileData);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackProfileView = async () => {
    try {
      await profileAPI.incrementProfileView(userId);
    } catch (err) {
      console.error('Error tracking profile view:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile-view-wrapper">
        <div className="profile-view-container">
          <div className="loading-container">Loading profile...</div>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || profile?.name || profile?.email || user.name || user.email;
  const profileRole = profile?.role || user.role;
  const profileEmail = profile?.email || user.email;
  
  // Calculate age with validation
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    const today = new Date();
    
    // Check if date is valid
    if (isNaN(birth.getTime())) return null;
    
    // Check if date is in the future
    if (birth > today) return null;
    
    const age = Math.floor((today - birth) / 31557600000);
    
    // Return null for invalid ages
    if (age < 0 || age > 150) return null;
    
    return age;
  };
  
  const age = calculateAge(profile?.date_of_birth);
  const profilePicture = profile?.profile_picture || (isOwnProfile ? user.profile_picture : null);

  return (
    <div className="profile-view-wrapper">
      <div className="profile-view-container">
      {/* Hero Section with Stats */}
      <div className="profile-hero-section">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcZcR-S4HGd2p4duZne5HCr6korDcR7_3Wx-DkPiw3ZQS_HVIHUDbAAQlbtEdRXidhX0rGvdQ1VpGw3fTXTpURZ4yUgKM-r2gJFzCJLXqSeM8R8sBGHMHwRdXJmpmFJljS_9-pyJIe_Op8BSksLpO-rmC9Stjy_dyGsI2bLRqPE42zmg5tIzH4ahI84UlJZbGA7GoUCMfHraI7GhxOfGoUMHdliD6S5Lk5Wkt6kfEQurZtMsnNsai7UxeaelUX8pccRLyeg60HDbaQ"
          className="profile-hero-image"
          alt="stadium"
        />
        
        {/* Hero Overlay Info */}
        <div className="profile-hero-overlay">
          <div className="profile-hero-content">
            {profilePicture ? (
              <img src={profilePicture} alt={displayName} className="profile-hero-avatar" />
            ) : (
              <div className="profile-hero-avatar placeholder">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="profile-hero-info">
              <h1>{displayName}</h1>
              <p className="profile-hero-meta">
                {profileRole === 'player' ? 'Elite Player' : 'Scout'} • {profile?.location || 'Location'}
              </p>
            </div>
          </div>
          
          {isOwnProfile && (
            <button className="btn-edit-profile-hero" onClick={() => navigate('/profile/edit')}>
              <span className="material-icons">edit</span> Edit Profile
            </button>
          )}
        </div>

        {/* Stats Section Below Hero */}
        <div className="profile-stats-section">
          <div className="profile-stat-card">
            <p className="stat-label">Videos Uploaded</p>
            <h2 className="stat-value">{profile?.total_videos || 0}</h2>
          </div>
          <div className="profile-stat-card">
            <p className="stat-label">Applause</p>
            <h2 className="stat-value">{profile?.total_likes || 0}</h2>
          </div>
          <div className="profile-stat-card">
            <p className="stat-label">Profile Views</p>
            <h2 className="stat-value">{profile?.profile_views || 0}</h2>
          </div>
        </div>
      </div>

      {/* Statistics Section - Above Tabs - Only for Players */}
      {profileRole === 'player' && (
        <div className="profile-stats-display">
          <div className="profile-stat-item">
            <p className="stat-label">Videos Uploaded</p>
            <h3 className="stat-number">{profile?.total_videos || 0}</h3>
          </div>
          <div className="profile-stat-item">
            <p className="stat-label">Applause</p>
            <h3 className="stat-number">{profile?.total_likes || 0}</h3>
          </div>
          <div className="profile-stat-item">
            <p className="stat-label">Profile Views</p>
            <h3 className="stat-number">{profile?.profile_views || 0}</h3>
          </div>
        </div>
      )}

      {/* Profile Tabs */}
      <div className="profile-tabs">
        {profileRole === 'player' && (
          <>
            <button 
              className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              <span className="material-icons">person</span>
              Basic Info
            </button>
            
            <button 
              className={`tab-button ${activeTab === 'cricket' ? 'active' : ''}`}
              onClick={() => setActiveTab('cricket')}
            >
              <span className="material-icons">sports_cricket</span>
              Cricket Info
            </button>
            <button 
              className={`tab-button ${activeTab === 'career' ? 'active' : ''}`}
              onClick={() => setActiveTab('career')}
            >
              <span className="material-icons">emoji_events</span>
              Career
            </button>
            <button 
              className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <span className="material-icons">video_library</span>
              Videos
            </button>
          </>
        )}

        {profileRole === 'scout' && (
          <>
            <button 
              className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <span className="material-icons">person</span>
              Personal Info
            </button>
            <button 
              className={`tab-button ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <span className="material-icons">work</span>
              Professional Info
            </button>
          </>
        )}
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* SCOUT PROFILE - Grid layout with tabs and Bio on right */}
        {profileRole === 'scout' && (
          <div className="profile-content-grid">
            {/* LEFT SIDE - Changes based on active tab */}
            <div className="profile-content-left">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="profile-section">
                  <h2>Personal Details</h2>
                  <div className="details-grid">
                    {/* LEFT COLUMN */}
                    {profile?.date_of_birth && (
                      <div className="detail-item">
                        <span className="detail-label">Age</span>
                        <span className="detail-value">{age} years</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    {profile?.gender && (
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{profile.gender}</span>
                      </div>
                    )}
                    {/* LEFT COLUMN */}
                    {profile?.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{profile.phone}</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{profileEmail}</span>
                    </div>
                    {/* LEFT COLUMN */}
                    {profile?.location && (
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{profile.location}</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    {profile?.district && (
                      <div className="detail-item">
                        <span className="detail-label">District</span>
                        <span className="detail-value">{profile.district}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div className="profile-section">
                  <h2>Professional Info</h2>
                  <div className="info-grid">
                    {profile?.organization && (
                      <div className="info-item">
                        <span className="info-label">Organization</span>
                        <span className="info-value">{profile.organization}</span>
                      </div>
                    )}
                    {profile?.years_experience && (
                      <div className="info-item">
                        <span className="info-label">Experience</span>
                        <span className="info-value">{profile.years_experience} years</span>
                      </div>
                    )}
                    {profile?.certification && (
                      <div className="info-item full-width">
                        <span className="info-label">Certification</span>
                        <span className="info-value">{profile.certification}</span>
                      </div>
                    )}
                  </div>

                  {profile?.specialization && profile.specialization.length > 0 && (
                    <div className="list-section">
                      <h3>Specialization</h3>
                      <div className="tags-display">
                        {profile.specialization.map((spec, idx) => (
                          <span key={idx} className="tag">{spec}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDE - Bio */}
            <div className="profile-content-right">
              <div className="profile-section">
                <h2>Bio</h2>
                <p className="bio-text">{profile?.bio || 'No bio added yet'}</p>
              </div>
            </div>
          </div>
        )}

        {/* PLAYER PROFILE - Grid layout with tabs */}
        {profileRole === 'player' && (
          <div className="profile-content-grid">
            {/* LEFT SIDE - Changes based on active tab */}
            <div className="profile-content-left">
              {/* Personal Details Tab */}
              {activeTab === 'basic' && (
                <div className="profile-section">
                  <h2>Personal Details</h2>
                  <div className="details-grid">
                    {/* LEFT COLUMN */}
                    {profile?.date_of_birth && (
                      <div className="detail-item">
                        <span className="detail-label">Age</span>
                        <span className="detail-value">{age} years</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    {profile?.gender && (
                      <div className="detail-item">
                        <span className="detail-label">Gender</span>
                        <span className="detail-value">{profile.gender}</span>
                      </div>
                    )}
                    {/* LEFT COLUMN */}
                    {profile?.phone && (
                      <div className="detail-item">
                        <span className="detail-label">Phone</span>
                        <span className="detail-value">{profile.phone}</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    <div className="detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-value">{profileEmail}</span>
                    </div>
                    {/* LEFT COLUMN */}
                    {profile?.location && (
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{profile.location}</span>
                      </div>
                    )}
                    {/* RIGHT COLUMN */}
                    {profile?.district && (
                      <div className="detail-item">
                        <span className="detail-label">District</span>
                        <span className="detail-value">{profile.district}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Cricket Information Tab (Players Only) */}
              {activeTab === 'cricket' && profileRole === 'player' && (
                <div className="profile-section">
                  <h2>Cricket Info</h2>
                  <div className="info-grid">
                    {profile?.position && (
                      <div className="info-item">
                        <span className="info-label">Primary Role</span>
                        <span className="info-value highlight">{profile.position}</span>
                      </div>
                    )}
                    {profile?.batting_style && (
                      <div className="info-item">
                        <span className="info-label">Batting Style</span>
                        <span className="info-value">{profile.batting_style}</span>
                      </div>
                    )}
                    {profile?.bowling_style && profile.bowling_style !== 'Does not bowl' && (
                      <div className="info-item">
                        <span className="info-label">Bowling Style</span>
                        <span className="info-value">{profile.bowling_style}</span>
                      </div>
                    )}
                    {profile?.height && (
                      <div className="info-item">
                        <span className="info-label">Height</span>
                        <span className="info-value">{profile.height} cm</span>
                      </div>
                    )}
                    {profile?.weight && (
                      <div className="info-item">
                        <span className="info-label">Weight</span>
                        <span className="info-value">{profile.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Career Information Tab (Players Only) */}
              {activeTab === 'career' && profileRole === 'player' && (
                <div className="profile-section">
                  <h2>Career</h2>
                  <div className="info-grid">
                    {profile?.current_team && (
                      <div className="info-item full-width">
                        <span className="info-label">Current Team</span>
                        <span className="info-value">{profile.current_team}</span>
                      </div>
                    )}
                    {profile?.school_college && (
                      <div className="info-item full-width">
                        <span className="info-label">School/College</span>
                        <span className="info-value">{profile.school_college}</span>
                      </div>
                    )}
                  </div>

                  {profile?.previous_teams && profile.previous_teams.length > 0 && (
                    <div className="list-section">
                      <h3>Previous Teams</h3>
                      <div className="tags-display">
                        {profile.previous_teams.map((team, idx) => (
                          <span key={idx} className="tag">{team}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile?.achievements && profile.achievements.length > 0 && (
                    <div className="list-section">
                      <h3>Achievements & Awards</h3>
                      <ul className="achievements-list">
                        {profile.achievements.map((achievement, idx) => (
                          <li key={idx}>
                            <span className="material-icons">emoji_events</span> {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}


            </div>

            {/* RIGHT SIDE - Recent Videos (Always visible) */}
            <div className="profile-content-right">
              <div className="profile-section">
                <h2 className="videos-title">Recent Videos</h2>
                <div className="videos-grid">
                  <div className="video-placeholder">
                    <span className="material-icons">video_library</span>
                    <p>No videos yet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BIO SECTION - Spans 2 columns below */}
            <div className="profile-section profile-bio-section">
              <h2>Bio</h2>
              <p className="bio-text">{profile?.bio || 'No bio added yet'}</p>
            </div>
          </div>
        )}

        {/* Videos Tab - Only for Players */}
        {activeTab === 'videos' && profileRole === 'player' && (
          <div className="profile-content-grid">
            {/* LEFT SIDE - VideoManager */}
            <div className="profile-content-left">
              <VideoManager 
                userId={userId || user.id} 
                isOwnProfile={isOwnProfile}
              />
            </div>

            {/* RIGHT SIDE - Recent Videos */}
            <div className="profile-content-right">
              <div className="profile-section">
                <h2 className="videos-title">Recent Videos</h2>
                <div className="videos-grid">
                  <div className="video-placeholder">
                    <span className="material-icons">video_library</span>
                    <p>No videos yet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* BIO SECTION - Spans 2 columns below */}
            <div className="profile-section profile-bio-section">
              <h2>Bio</h2>
              <p className="bio-text">{profile?.bio || 'No bio added yet'}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!profile && (
          <div className="empty-profile">
            <div className="empty-icon">
              <span className="material-icons">edit</span>
            </div>
            <h3>Complete Your Profile</h3>
            <p>Add your information to get discovered by scouts and teams!</p>
            <button className="btn-primary" onClick={() => navigate('/profile/edit')}>
              Complete Profile
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
