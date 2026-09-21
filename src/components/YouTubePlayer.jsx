import { useState, useEffect, useMemo, useRef } from "react";
import { formatTime } from "../hooks/useTimer";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";

function ShuffleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function VolumeIcon({ muted, vol }) {
  if (muted || vol === 0) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

export default function YouTubePlayer({
  song,
  songs,
  isPlaying,
  setIsPlaying,
  onNext,
  onPrev,
  onSelect,
  shuffle,
  onToggleShuffle,
  currentVolume = 0.72,
  onVolumeChange,
  timerSeconds = 0,
  timerRunning = false,
  onStartTimer,
  onStopTimer
}) {
  const [queueOpen, setQueueOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [imgError, setImgError] = useState(false);
  const activeItemRef = useRef(null);

  useEffect(() => {
    setImgError(false);
  }, [song.youtubeId]);

  const yt = useYouTubePlayer({
    videoId: song.youtubeId,
    initialVolume: currentVolume,
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

  const choose = (songItem) => {
    const originalIndex = songs.findIndex((s) => s.id === songItem.id);
    if (originalIndex !== -1) {
      onSelect(originalIndex);
      setIsPlaying(true);
      setQueueOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (!yt.ready || !song.youtubeId) return;
    if (isPlaying) {
      yt.play();
    } else {
      yt.pause();
    }
  }, [isPlaying, yt.ready, song.youtubeId, yt.play, yt.pause]);

  const handleSeekChange = (e) => {
    setSeekTime(Number(e.target.value));
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekTime(yt.currentTime);
  };

  const handleSeekEnd = () => {
    yt.seek(seekTime);
    setIsSeeking(false);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    yt.volume(val);
    onVolumeChange?.(val);
  };

  const toggleMute = () => {
    if (currentVolume > 0) {
      yt.volume(0);
      onVolumeChange?.(0);
    } else {
      yt.volume(0.72);
      onVolumeChange?.(0.72);
    }
  };

  const effectiveCurrentTime = isSeeking ? seekTime : yt.currentTime;
  const progress = yt.duration ? Math.min(100, (effectiveCurrentTime / yt.duration) * 100) : 0;

  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    const q = searchQuery.toLowerCase().trim();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.mood && s.mood.toLowerCase().includes(q))
    );
  }, [songs, searchQuery]);

  useEffect(() => {
    if (queueOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [queueOpen]);

  return (
    <div className={`player-shell ${queueOpen ? "queue-open" : ""}`}>
      {/* Hidden container for YouTube IFrame */}
      <div className="yt-host" aria-hidden="true" ref={yt.hostRef} />

      {queueOpen && (
        <div className="media-flyout" role="dialog" aria-label="आज की महफ़िल">
          <div className="flyout-blur" onClick={() => setQueueOpen(false)} />
          <div className="playlist">
            <div className="playlist-head">
              <div>
                <small>CHAUPAL RADIO</small>
                <strong>आज की महफ़िल</strong>
              </div>
              <button
                className="close-flyout"
                onClick={() => setQueueOpen(false)}
                aria-label="बंद करें"
              >
                ×
              </button>
            </div>

            <div className="playlist-search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="playlist-search"
                placeholder="गीत या गायक खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="गीत खोजें"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="खोज साफ़ करें"
                >
                  ×
                </button>
              )}
            </div>

            <div className="playlist-list">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((s) => {
                  const isCurrent = s.id === song.id;
                  return (
                    <button
                      ref={isCurrent ? activeItemRef : null}
                      className={`playlist-item ${isCurrent ? "selected" : ""}`}
                      key={s.id}
                      onClick={() => choose(s)}
                    >
                      <span className="playlist-no">{String(s.id).padStart(2, "0")}</span>
                      <span className="playlist-art">♪</span>
                      <span className="playlist-copy">
                        <b>{s.title}</b>
                        <small>{s.artist}</small>
                      </span>
                      <span className="playlist-mood">{s.mood}</span>
                      <span className="playlist-state">
                        {s.youtubeId ? (isCurrent && isPlaying ? "●" : "▶") : "ID जोड़ें"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="playlist-empty">कोई गीत नहीं मिला</div>
              )}
            </div>
            <div className="flyout-footer">
              YouTube से संचालित · आधिकारिक एम्बेड · {songs.length} गीत
            </div>
          </div>
        </div>
      )}

      {/* Main Now-Playing Deck */}
      <div className="now-playing">
        <div className={`cover-art ${isPlaying ? "spinning" : ""}`}>
          {song.youtubeId && !imgError ? (
            <img
              src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
              alt={song.title}
              className="thumbnail"
              loading="lazy"
              onError={() => setImgError(true)}
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
        <div className={`equalizer ${isPlaying ? "active" : ""}`} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>

        {/* Transport Controls directly in header row */}
        <div className="transport">
          <button className="transport-btn" onClick={onPrev} aria-label="पिछला गीत" title="पिछला (←)">
            ‹
          </button>
          <button
            className="transport-play"
            onClick={toggle}
            aria-label={isPlaying ? "रोकें" : "चलाएँ"}
            title={isPlaying ? "रोकें (Space)" : "चलाएँ (Space)"}
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>
          <button className="transport-btn" onClick={onNext} aria-label="अगला गीत" title="अगला (→)">
            ›
          </button>
        </div>
      </div>

      {/* Progress Slider with High-Contrast Timestamps */}
      <div className="progress-row">
        <span className="time-display">{formatTime(Math.floor(effectiveCurrentTime))}</span>
        <div className="progress-wrap">
          <input
            type="range"
            min="0"
            max={yt.duration || 1}
            step="0.1"
            value={effectiveCurrentTime}
            style={{ "--progress": `${progress}%` }}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            aria-label="गीत की प्रगति"
          />
        </div>
        <span className="time-display">{yt.duration ? formatTime(Math.floor(yt.duration)) : "--:--"}</span>
      </div>

      {/* Unified Player Console Footer */}
      <div className="player-footer">
        <div className="footer-left">
          <button
            className={`queue-button ${queueOpen ? "active" : ""}`}
            onClick={() => setQueueOpen((v) => !v)}
            aria-expanded={queueOpen}
          >
            <span>☰</span> आज की महफ़िल <b>{songs.length}</b>
          </button>

          {/* Integrated Focus Timer Pills */}
          <div className="timer-dock">
            <span className="timer-dock-label" title="ठहराव टाइमर">⏱ ठहराव:</span>
            {[15, 25, 45].map((m) => {
              const isActive = timerRunning && timerSeconds === m * 60;
              return (
                <button
                  key={m}
                  type="button"
                  className={`timer-pill ${isActive ? "active" : ""}`}
                  onClick={() => (isActive ? onStopTimer?.() : onStartTimer?.(m))}
                  title={`${m} मिनट का टाइमर`}
                >
                  {m}m
                </button>
              );
            })}
            {timerRunning && (
              <span className="timer-countdown">
                {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}
                <button
                  type="button"
                  className="timer-stop-mini"
                  onClick={onStopTimer}
                  title="टाइमर रोकें"
                  aria-label="टाइमर रोकें"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        <div className="footer-right">
          <button
            type="button"
            className={`shuffle-footer-btn ${shuffle ? "active" : ""}`}
            onClick={onToggleShuffle}
            aria-label={shuffle ? "शफल चालू है" : "शफल बंद है"}
            title={shuffle ? "शफल चालू है (S)" : "शफल बंद है (S)"}
          >
            <ShuffleIcon />
          </button>

          <div className="volume">
            <button
              type="button"
              className="volume-icon-btn"
              onClick={toggleMute}
              title={currentVolume > 0 ? "म्यूट करें (M)" : "आवाज़ खोलें (M)"}
              aria-label="आवाज़ बटन"
            >
              <VolumeIcon muted={currentVolume === 0} vol={currentVolume} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={currentVolume}
              onChange={handleVolumeChange}
              aria-label="आवाज़"
            />
          </div>
        </div>
      </div>

      {yt.error && <div className="yt-message">{yt.error}</div>}
    </div>
  );
}
