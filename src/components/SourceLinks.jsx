import { providers } from "../data/providers";

export default function SourceLinks() {
  const open = url => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="source-links">
      <button className="source-btn spotify" onClick={() => open(providers.spotify.url)} title={providers.spotify.helper}>
        <span className="source-icon">{providers.spotify.icon}</span>
        <span>{providers.spotify.label}</span>
        <small>playlist ↗</small>
      </button>
      <button className="source-btn yt-music" onClick={() => open(providers.youtubeMusic.url)} title={providers.youtubeMusic.helper}>
        <span className="source-icon">{providers.youtubeMusic.icon}</span>
        <span>{providers.youtubeMusic.label}</span>
        <small>playlist ↗</small>
      </button>
    </div>
  );
}
