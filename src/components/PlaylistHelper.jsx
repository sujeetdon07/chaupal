import { useState } from "react";

/**
 * PlaylistHelper Component
 * Interactive guide to extract and add songs from YouTube Music playlist
 */
export function PlaylistHelper() {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const playlistUrl = "https://music.youtube.com/playlist?list=PLPiAo2ZBW-yc&si=x5-gxcrU8Ca91GNe";
  
  const extractionCode = `const songs = [];
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
        artist: 'Artist Name',
        youtubeId: videoId,
        duration: '--:--',
        mood: 'सुन'
      });
    }
  }
});
console.log(JSON.stringify(songs, null, 2));`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "rgba(0,0,0,0.5)",
      borderRadius: "8px",
      margin: "20px 0",
      fontFamily: "monospace",
      color: "#ddd",
      border: "1px solid #666"
    }}>
      <h3>🎵 Setup Your YouTube Music Playlist</h3>
      
      <div style={{ marginBottom: "15px" }}>
        <p><strong>Playlist Link:</strong></p>
        <a 
          href={playlistUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ color: "#4da6ff", textDecoration: "none" }}
        >
          {playlistUrl}
        </a>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <h4>Quick Setup (2 minutes):</h4>
        <ol>
          <li>Visit the playlist link above in a new tab</li>
          <li>Scroll down to load all songs</li>
          <li>Open DevTools: Press <code>F12</code></li>
          <li>Go to <code>Console</code> tab</li>
          <li>Click the button below to copy the code</li>
          <li>Paste it in the console and press Enter</li>
          <li>Copy the JSON output from console</li>
          <li>Replace the songs array in <code>src/data/songs.js</code></li>
        </ol>
      </div>

      <button
        onClick={() => setShowCode(!showCode)}
        style={{
          backgroundColor: "#4da6ff",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: "10px"
        }}
      >
        {showCode ? "Hide Code" : "Show Extraction Code"}
      </button>

      <button
        onClick={copyToClipboard}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {copied ? "✓ Copied!" : "Copy Code"}
      </button>

      {showCode && (
        <pre style={{
          backgroundColor: "#1a1a1a",
          padding: "12px",
          borderRadius: "4px",
          overflow: "auto",
          marginTop: "15px",
          fontSize: "12px"
        }}>
          {extractionCode}
        </pre>
      )}

      <div style={{ marginTop: "15px", fontSize: "12px", color: "#aaa" }}>
        <p><strong>Need alternatives?</strong></p>
        <ul>
          <li><code>yt-dlp</code> command line tool (batch extraction)</li>
          <li>YouTube Data API (for backend integration)</li>
          <li>Manual copy-paste from playlist</li>
        </ul>
      </div>
    </div>
  );
}

export default PlaylistHelper;
