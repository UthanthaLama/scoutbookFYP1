const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { authenticateToken } = require('../middleware/auth');
const { extractYouTubeId, getYouTubeThumbnail, isValidYouTubeUrl } = require('../utils/youtube');

// Get user's videos
router.get('/user/:userId', async (req, res) => {
  try {
    const query = `
      SELECT * FROM videos 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await require('../config/database').query(query, [req.params.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get current user's videos
router.get('/my-videos', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM videos 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await require('../config/database').query(query, [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching my videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Add a new video
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, video_url, category } = req.body;
    
    // Validate YouTube URL
    if (!isValidYouTubeUrl(video_url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    // Extract video ID
    const videoId = extractYouTubeId(video_url);
    if (!videoId) {
      return res.status(400).json({ error: 'Could not extract video ID from URL' });
    }
    
    // Generate thumbnail URL
    const thumbnail_url = getYouTubeThumbnail(videoId);
    
    // Create video record
    const videoData = {
      user_id: req.user.id,
      title: title || 'Untitled Video',
      description: description || '',
      video_url: `https://www.youtube.com/watch?v=${videoId}`, // Normalize URL
      thumbnail_url,
      sport: 'Cricket', // Default to cricket
      category: category || 'highlight'
    };
    
    const video = await Video.create(videoData);
    
    // Update profile total_videos count
    await require('../config/database').query(
      'UPDATE profiles SET total_videos = total_videos + 1 WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json(video);
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// Update video
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const videoId = req.params.id;
    
    // Verify ownership
    const checkQuery = 'SELECT user_id FROM videos WHERE id = $1';
    const checkResult = await require('../config/database').query(checkQuery, [videoId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    if (checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this video' });
    }
    
    // Update video
    const query = `
      UPDATE videos 
      SET title = $1, description = $2, category = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await require('../config/database').query(query, [
      title, description, category, videoId
    ]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const videoId = req.params.id;
    
    // Verify ownership
    const checkQuery = 'SELECT user_id FROM videos WHERE id = $1';
    const checkResult = await require('../config/database').query(checkQuery, [videoId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    if (checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }
    
    // Delete video
    await require('../config/database').query('DELETE FROM videos WHERE id = $1', [videoId]);
    
    // Update profile total_videos count
    await require('../config/database').query(
      'UPDATE profiles SET total_videos = GREATEST(total_videos - 1, 0) WHERE user_id = $1',
      [req.user.id]
    );
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Increment video views
router.post('/:id/view', async (req, res) => {
  try {
    const videoId = req.params.id;
    
    await require('../config/database').query(
      'UPDATE videos SET views_count = views_count + 1 WHERE id = $1',
      [videoId]
    );
    
    res.json({ message: 'View counted' });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({ error: 'Failed to increment views' });
  }
});

module.exports = router;
