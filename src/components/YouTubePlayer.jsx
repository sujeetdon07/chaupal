import { useState, useEffect, useRef } from "react";
import { formatTime } from "../hooks/useTimer";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";

export default function YouTubePlayer({ song, songs, isPlaying, setIsPlaying, onNext, onPrev, onSelect, shuffle, onToggleShuffle }) {
  const [queueOpen, setQueueOpen] = useState(false);
  
  const yt = useYouTubePlayer({
    videoId: song.youtubeId,
    onPlaying: () => setIsPlaying(true),
    onPaused: () => setIsPlaying(false),
    onEnded: onNext,
    onNext: onNext,
    onPrev: onPrev,
    songTitle: song.title,
    songArtist: song.artist
  });

  const toggle = () => {
    if (!song.youtubeId || !yt.ready) return;
    setIsPlaying(!isPlaying);
  };

  const choose = index => {
    onSelect(index);
    setIsPlaying(true);
    setQueueOpen(false);
  };

  // Handle play/pause state changes with aggressive retry
  useEffect(() => {
    if (!song.youtubeId) return;

    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10;

    const attemptPlay = () => {
      if (!mounted) return;

      try {
        if (isPlaying && yt.ready) {
          yt.play();
        } else if (!isPlaying && yt.ready) {
          yt.pause();
        } else if (isPlaying && !yt.ready && retryCount < maxRetries) {
          // Retry if player not ready yet
          retryCount++;
          setTimeout(attemptPlay, 150);
        }
      } catch (e) {
        console.error('Play attempt failed:', e);
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(attemptPlay, 150);
        }
      }
    };

    attemptPlay();

    return () => {
      mounted = false;
    };
  }, [isPlaying, yt.ready, song.youtubeId, yt]);

  const progress = yt.duration ? Math.min(100, (yt.currentTime / yt.duration) * 100) : 0;

  return (
    <div className={`player-shell ${queueOpen ? "queue-open" : ""}`}>
      <div className="yt-host" aria-hidden="true"><div ref={yt.hostRef} /></div>

      {queueOpen && (
        <div className="media-flyout">
          <div className="flyout-blur" />
          <div className="playlist">
            <div className="playlist-head">
              <div><small>CHAU PAL RADIO</small><strong>आज की महफ़िल</strong></div>
              <button onClick={() => setQueueOpen(false)}>×</button>
            </div>
            <div className="playlist-list">
              {songs.map((s, i) => (
                <button className={`playlist-item ${s.id === song.id ? "selected" : ""}`} key={s.id} onClick={() => choose(i)}>
                  <span className="playlist-no">{String(i + 1).padStart(2, "0")}</span>
                  <span className="playlist-art">♪</span>
                  <span className="playlist-copy"><b>{s.title}</b><small>{s.artist}</small></span>
                  <span className="playlist-mood">{s.mood}</span>
                  <span className="playlist-state">{s.youtubeId ? (s.id === song.id && isPlaying ? "●" : "▶") : "ID जोड़ें"}</span>
                </button>
              ))}
            </div>
            <div className="flyout-footer">YouTube से चल रहा है · MP3 host नहीं किया गया</div>
          </div>
        </div>
      )}

      <div className="now-playing">
        <div className={`cover-art ${isPlaying ? "spinning" : ""}`}>
          {song.youtubeId ? (
            <img 
              src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
              alt={song.title}
              className="thumbnail"
            />
          ) : (
            <span>♪</span>
          )}
        </div>
        <div className="track-meta">
          <small>अभी चौपाल पर</small>
          <strong>{song.title}</strong>
          <span>{song.artist}</span>
        </div>
        <div className={`equalizer ${isPlaying ? "active" : ""}`}><i/><i/><i/><i/></div>
      </div>

      <div className="transport">
        <button className="transport-btn" onClick={onPrev} aria-label="पिछला गीत">‹</button>
        <button className="transport-play" onClick={toggle} aria-label={isPlaying ? "रोकें" : "चलाएँ"}>
          {isPlaying ? "Ⅱ" : "▶"}
        </button>
        <button className="transport-btn" onClick={onNext} aria-label="अगला गीत">›</button>
      </div>

      <div className="progress-row">
        <span>{formatTime(Math.floor(yt.currentTime))}</span>
        <div className="progress-wrap">
          <input type="range" min="0" max={yt.duration || 1} value={yt.currentTime}
            style={{ "--progress": `${progress}%` }}
            onChange={e => yt.seek(e.target.value)} aria-label="गीत की प्रगति" />
        </div>
        <span>{yt.duration ? formatTime(Math.floor(yt.duration)) : "--:--"}</span>
      </div>

      <div className="player-footer">
        <button className={`queue-button ${queueOpen ? "active" : ""}`} onClick={() => setQueueOpen(v => !v)}>
          <span>☰</span> आज की महफ़िल <b>{songs.length}</b>
        </button>
        <button 
          className={`shuffle-footer-btn ${shuffle ? "active" : ""}`} 
          onClick={onToggleShuffle} 
          aria-label="शफल"
          title="शफल"
        >
          🔀
        </button>
        <div className="volume">
          <span>◖</span>
          <input type="range" min="0" max="1" step="0.01" defaultValue="0.72" onChange={e => yt.volume(e.target.value)} aria-label="आवाज़" />
        </div>
      </div>

      {yt.error && <div className="yt-message">{yt.error}</div>}
    </div>
  );
}
