/**
 * QUICK START: Adding Your YouTube Music Playlist Songs
 * 
 * Your Playlist: https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc&si=x5-gxcrU8Ca91GNe
 * 
 * ============================================
 * EASIEST METHOD: Browser Console (2 minutes)
 * ============================================
 * 
 * 1. Visit your playlist:
 *    https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc
 * 
 * 2. Scroll down to load all songs
 * 
 * 3. Open DevTools: Press F12 → go to Console tab
 * 
 * 4. Paste this code and press Enter:
 * 
 * ===== COPY THIS CODE =====
 * 
 * const songs = [];
 * document.querySelectorAll('[role="button"][data-watch-this-video-button]').forEach((el, i) => {
 *   const link = el.querySelector('a[href*="watch?v="]');
 *   if (link) {
 *     const href = link.getAttribute('href');
 *     const videoId = href.match(/v=([^&]+)/)?.[1];
 *     const titleEl = el.querySelector('[aria-label]');
 *     if (videoId) {
 *       songs.push({
 *         id: songs.length + 1,
 *         title: titleEl?.textContent || 'Song ' + (songs.length + 1),
 *         artist: 'Artist Name',
 *         youtubeId: videoId,
 *         duration: '--:--',
 *         mood: 'सुन'
 *       });
 *     }
 *   }
 * });
 * 
 * console.log('const songsFromPlaylist = ' + JSON.stringify(songs, null, 2));
 * 
 * ===== END CODE =====
 * 
 * 5. Copy the console output
 * 
 * 6. Replace the export in src/data/songs.js with the output
 * 
 * ============================================
 * ALTERNATIVE: YouTube Data API (Recommended)
 * ============================================
 * 
 * For a more robust solution:
 * 
 * 1. Get API key: https://console.cloud.google.com/
 *    - Create new project
 *    - Enable "YouTube Data API v3"
 *    - Create API key (public key is fine for learning)
 * 
 * 2. The app will support API integration soon
 * 
 * ============================================
 * ALTERNATIVE: Command Line Tool (yt-dlp)
 * ============================================
 * 
 * For batch extraction:
 * 
 * 1. Install: pip install yt-dlp
 * 
 * 2. Run:
 *    yt-dlp -j \"https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc\" | \
 *    jq -r '.[] | \"\\(.id) - \\(.title) - \\(.uploader)\"'
 * 
 * 3. Format output as song objects in src/data/songs.js
 */

export const playlistExtractionGuide = {
  playlistUrl: "https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc&si=x5-gxcrU8Ca91GNe",
  playlistId: "PLPiAo2ZBW-yc",
  
  steps: [
    "Visit the playlist URL",
    "Scroll to load all songs",
    "Open DevTools (F12)",
    "Paste extraction code in Console",
    "Copy the JSON output",
    "Add songs to src/data/songs.js"
  ],

  consoleCode: `
    const songs = [];
    document.querySelectorAll('[role="button"][data-watch-this-video-button]').forEach((el, i) => {
      const link = el.querySelector('a[href*="watch?v="]');
      if (link) {
        const href = link.getAttribute('href');
        const videoId = href.match(/v=([^&]+)/)?.[1];
        const titleEl = el.querySelector('[aria-label]');
        if (videoId) {
          songs.push({
            id: songs.length + 1,
            title: titleEl?.textContent || 'Song ' + (songs.length + 1),
            artist: 'Artist',
            youtubeId: videoId,
            duration: '--:--',
            mood: 'सुन'
          });
        }
      }
    });
    console.log('PASTE THIS:');
    console.log(JSON.stringify(songs, null, 2));
  `
};
