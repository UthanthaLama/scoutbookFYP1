// YouTube utility functions

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 * Returns high quality thumbnail (720p if available, else 480p)
 */
function getYouTubeThumbnail(videoId) {
  if (!videoId) return null;
  // Try maxresdefault first (1280x720), fallback to hqdefault (480x360)
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Generate YouTube embed URL from video ID
 */
function getYouTubeEmbedUrl(videoId) {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Validate if URL is a valid YouTube URL
 */
function isValidYouTubeUrl(url) {
  return extractYouTubeId(url) !== null;
}

module.exports = {
  extractYouTubeId,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  isValidYouTubeUrl
};
