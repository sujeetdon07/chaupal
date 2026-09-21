import { providers } from "../data/providers";

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1ed760" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.018.6-1.141 4.38-1.38 9.781-.72 13.5 1.56.36.239.54.84.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function YouTubeMusicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#FF0000" />
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <polygon points="10 8.5 15.5 12 10 15.5" fill="#FFFFFF" />
    </svg>
  );
}

export default function SourceLinks() {
  const open = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="source-links">
      <button
        type="button"
        className="source-btn spotify"
        onClick={() => open(providers.spotify.url)}
        title={providers.spotify.helper}
        aria-label={providers.spotify.helper}
      >
        <SpotifyIcon />
      </button>

      <button
        type="button"
        className="source-btn yt-music"
        onClick={() => open(providers.youtubeMusic.url)}
        title={providers.youtubeMusic.helper}
        aria-label={providers.youtubeMusic.helper}
      >
        <YouTubeMusicIcon />
      </button>
    </div>
  );
}
