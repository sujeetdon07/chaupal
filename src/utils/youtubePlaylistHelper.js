/**
 * YouTube Music Playlist Helper
 * Utilities to extract and manage songs from YouTube Music playlists
 */

/**
 * Extract playlist ID from YouTube Music URL
 * @param {string} url - YouTube Music playlist URL
 * @returns {string} Playlist ID
 */
export function extractPlaylistId(url) {
  const match = url.match(/list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch playlist metadata (requires backend service)
 * For frontend-only, users need to:
 * 1. Use YouTube Data API with server-side auth
 * 2. Use yt-dlp: `yt-dlp -j "https://music.youtube.com/playlist?list=..." | jq`
 * 3. Manually extract video IDs from browser console
 */
export async function fetchPlaylistVideos(playlistId) {
  // This requires a backend service with YouTube API key
  // Example backend implementation:
  const response = await fetch(`/api/playlist/${playlistId}`);
  const data = await response.json();
  return data.videos;
}

/**
 * Convert YouTube URL to video ID
 * Supports: youtube.com, youtu.be, music.youtube.com
 */
export function extractVideoId(url) {
  // youtu.be/xyz
  let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // youtube.com/watch?v=xyz
  match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Already just the ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  return null;
}

/**
 * Format song object for the app
 */
export function formatSongForPlaylist(songData, customId = null) {
  return {
    id: customId || songData.videoId,
    title: songData.title || "Unknown Title",
    artist: songData.artist || songData.channelName || "Unknown Artist",
    youtubeId: songData.videoId,
    duration: songData.duration ? formatDuration(songData.duration) : "--:--",
    mood: songData.mood || "सुन"
  };
}

/**
 * Format duration from seconds to MM:SS
 */
function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * MANUAL EXTRACTION METHOD:
 * 
 * To extract video IDs from YouTube Music playlist manually:
 * 
 * 1. Open your playlist in browser
 * 2. Scroll to load all songs
 * 3. Paste this in console:
 * 
 *    ```javascript
 *    Array.from(document.querySelectorAll('[role="button"][href*="watch?v="]'))
 *      .map(el => el.href.match(/v=([^&]+)/)?.[1])
 *      .filter(Boolean)
 *      .map((id, i) => ({
 *        id: i + 1,
 *        youtubeId: id,
 *        title: "Song Title",
 *        artist: "Artist Name",
 *        mood: "सुन"
 *      }))
 *    ```
 * 
 * 4. Copy the output and add to songs.js
 * 
 * 5. Or use yt-dlp command:
 *    yt-dlp -j "https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc" | \
 *    jq '.[] | {youtubeId: .id, title: .title, artist: .uploader}'
 */

export const EXTRACTION_HELP = `
📺 YouTube Music Playlist Integration Guide
==========================================

Your Playlist ID: PLPiAo2ZBW-yc

Option 1: Browser Console (Easiest)
-----------------------------------
1. Go to: https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc
2. Scroll to load all songs
3. Open DevTools (F12) → Console
4. Paste:

Array.from(document.querySelectorAll('[href*="watch?v="]'))
  .map(el => el.href.match(/v=([^&]+)/)?.[1])
  .filter(Boolean)
  .slice(0, 100)

5. This gives you video IDs. Format them as song objects:

{
  id: 1,
  title: "Song Name",
  artist: "Artist Name",
  youtubeId: "VIDEO_ID",
  duration: "--:--",
  mood: "सुन"
}

Option 2: Command Line (yt-dlp)
-------------------------------
Install: pip install yt-dlp

Command:
yt-dlp -j "https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc" | \\
jq '.[] | {id, youtubeId: .id, title: .title, artist: .uploader}' > videos.json

Option 3: YouTube Data API (Recommended for App)
------------------------------------------------
Get API key from: https://console.cloud.google.com/
Create backend endpoint to fetch playlist videos
Call from frontend via your backend

For now, Option 1 (Browser Console) is fastest!
`;
