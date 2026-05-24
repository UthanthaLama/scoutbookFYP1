import React, { useState, useEffect } from 'react';
import { videosAPI } from '../services/api';
import '../styles/video-manager.css';

export default function VideoManager({ userId, isOwnProfile }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVideo, setNewVideo] = useState({
    video_url: '',
    title: '',
    description: '',
    category: 'highlight'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadVideos();
  }, [userId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const data = isOwnProfile 
        ? await videosAPI.getMyVideos()
        : await videosAPI.getUserVideos(userId);
      setVideos(data);
    } catch (err) {
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newVideo.video_url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    try {
      await videosAPI.addVideo(newVideo);
      setSuccess('Video added successfully!');
      setNewVideo({ video_url: '', title: '', description: '', category: 'highlight' });
      setShowAddForm(false);
      loadVideos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add video');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await videosAPI.deleteVideo(videoId);
      setSuccess('Video deleted successfully!');
      loadVideos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete video');
    }
  };

  const extractVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  if (loading) {
    return <div className="video-manager-loading">Loading videos...</div>;
  }

  return (
    <div className="video-manager">
      <div className="video-manager-header">
        <h2>
          <span className="material-icons">video_library</span>
          Highlight Videos
        </h2>
        {isOwnProfile && (
          <button 
            className="btn-add-video"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <span className="material-icons">add</span>
            Add Video
          </button>
        )}
      </div>

      {error && <div className="video-error">{error}</div>}
      {success && <div className="video-success">{success}</div>}

      {/* Add Video Form */}
      {showAddForm && isOwnProfile && (
        <div className="add-video-form">
          <h3>Add YouTube Video</h3>
          <p className="form-hint">
            <span className="material-icons">info</span>
            Upload your video to YouTube first, then paste the URL here
          </p>
          
          <form onSubmit={handleAddVideo}>
            <div className="form-group">
              <label>YouTube URL *</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newVideo.video_url}
                onChange={(e) => setNewVideo({ ...newVideo, video_url: e.target.value })}
                required
              />
              <small>Supported formats: youtube.com/watch?v=..., youtu.be/...</small>
            </div>

            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                placeholder="e.g., Batting Highlights - 50 runs"
                value={newVideo.title}
                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Describe your performance..."
                value={newVideo.description}
                onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newVideo.category}
                onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
              >
                <option value="highlight">Highlight</option>
                <option value="match">Match</option>
                <option value="training">Training</option>
                <option value="skill">Skill Demo</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                <span className="material-icons">add_circle</span>
                Add Video
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="no-videos">
          <span className="material-icons">videocam_off</span>
          <p>{isOwnProfile ? 'No videos yet. Add your first highlight video!' : 'No videos available'}</p>
        </div>
      ) : (
        <div className="videos-grid">
          {videos.map((video) => {
            const videoId = extractVideoId(video.video_url);
            return (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  {videoId ? (
                    <div className="video-embed-wrapper">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <a 
                        href={video.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="video-overlay-link"
                        title="Watch on YouTube"
                      >
                        <span className="material-icons">play_circle_outline</span>
                      </a>
                    </div>
                  ) : (
                    <div className="video-error-placeholder">Invalid video</div>
                  )}
                </div>
                <div className="video-info">
                  <h4>{video.title}</h4>
                  {video.description && <p>{video.description}</p>}
                  <div className="video-meta">
                    <span className="video-category">{video.category}</span>
                    <span className="video-views">
                      <span className="material-icons">visibility</span>
                      {video.views_count || 0}
                    </span>
                  </div>
                  <div className="video-actions">
                    <a 
                      href={video.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-watch-youtube"
                    >
                      <span className="material-icons">play_arrow</span>
                      Watch on YouTube
                    </a>
                    {isOwnProfile && (
                      <button 
                        className="btn-delete-video"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <span className="material-icons">delete</span>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
