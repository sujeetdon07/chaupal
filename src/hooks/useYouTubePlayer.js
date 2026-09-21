import { useEffect, useRef, useState, useCallback } from "react";

let apiPromise = null;

function loadYouTubeAPI() {
  if (typeof window !== "undefined" && window.YT?.Player) {
    return Promise.resolve(window.YT);
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return apiPromise;
}

export function useYouTubePlayer({
  videoId,
  autoPlay = false,
  initialVolume = 0.72,
  onPlaying,
  onPaused,
  onEnded,
  onReady,
  onNext,
  onPrev,
  onError,
  songTitle,
  songArtist
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isReadyRef = useRef(false);
  const currentVideoIdRef = useRef(videoId);
  const pendingVideoIdRef = useRef(videoId);
  const skipTimeoutRef = useRef(null);
  const wakeLockRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");

  // Store latest callbacks in ref to avoid stale closures
  const callbacksRef = useRef({
    onPlaying,
    onPaused,
    onEnded,
    onReady,
    onNext,
    onPrev,
    onError
  });

  useEffect(() => {
    callbacksRef.current = {
      onPlaying,
      onPaused,
      onEnded,
      onReady,
      onNext,
      onPrev,
      onError
    };
  });

  // Keep track of desired videoId
  useEffect(() => {
    pendingVideoIdRef.current = videoId;
  }, [videoId]);

  // Setup MediaSession Metadata & Handlers
  const updateMediaSession = useCallback((title, artist, vid) => {
    if (typeof navigator === "undefined" || !('mediaSession' in navigator)) return;

    try {
      if (title && vid) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: title || 'चौपाल रेडियो',
          artist: artist || 'गाँव की महफ़िल',
          album: 'चौपाल रेडियो',
          artwork: [
            { src: `https://img.youtube.com/vi/${vid}/mqdefault.jpg`, sizes: '320x180', type: 'image/jpeg' },
            { src: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' }
          ]
        });
      }

      navigator.mediaSession.setActionHandler('play', () => {
        try {
          playerRef.current?.playVideo();
        } catch (_) {}
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        try {
          playerRef.current?.pauseVideo();
        } catch (_) {}
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        callbacksRef.current.onPrev?.();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        callbacksRef.current.onNext?.();
      });
    } catch (e) {
      console.warn('MediaSession init error:', e);
    }
  }, []);

  // Update Media Session when track changes
  useEffect(() => {
    updateMediaSession(songTitle, songArtist, videoId);
  }, [songTitle, songArtist, videoId, updateMediaSession]);

  // Initialize YouTube Player ONCE
  useEffect(() => {
    let unmounted = false;
    let pollInterval = null;

    if (!containerRef.current) return;

    loadYouTubeAPI().then((YT) => {
      if (unmounted || !containerRef.current || playerRef.current) return;

      // Create an internal div to be replaced by the iframe
      const mountNode = document.createElement("div");
      containerRef.current.appendChild(mountNode);

      const player = new YT.Player(mountNode, {
        width: "100%",
        height: "100%",
        videoId: pendingVideoIdRef.current || videoId || "",
        playerVars: {
          playsinline: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
          disablekb: 1,
          iv_load_policy: 3
        },
        events: {
          onReady: (event) => {
            if (unmounted) return;
            playerRef.current = event.target;
            isReadyRef.current = true;
            currentVideoIdRef.current = pendingVideoIdRef.current;

            // Set initial volume immediately
            try {
              event.target.setVolume(Math.round(initialVolume * 100));
            } catch (_) {}

            setReady(true);
            const d = event.target.getDuration() || 0;
            setDuration(d);

            callbacksRef.current.onReady?.(event.target);

            // If a different video was requested while initializing, load it
            if (pendingVideoIdRef.current && pendingVideoIdRef.current !== videoId) {
              event.target.loadVideoById(pendingVideoIdRef.current);
            } else if (autoPlay) {
              event.target.playVideo();
            }
          },
          onStateChange: (event) => {
            if (unmounted) return;

            if (event.data === YT.PlayerState.PLAYING) {
              isPlayingRef.current = true;
              setIsPlayingState(true);
              setError("");
              if (skipTimeoutRef.current) {
                clearTimeout(skipTimeoutRef.current);
                skipTimeoutRef.current = null;
              }
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
              }
              // Request screen wake lock to prevent screen from turning off
              if ('wakeLock' in navigator) {
                navigator.wakeLock.request('screen').then(lock => {
                  wakeLockRef.current = lock;
                }).catch(err => {
                  console.log('Wake Lock error:', err);
                });
              }
              callbacksRef.current.onPlaying?.();
            } else if (event.data === YT.PlayerState.PAUSED) {
              isPlayingRef.current = false;
              setIsPlayingState(false);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
              }
              // Release wake lock when paused
              if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
              }
              callbacksRef.current.onPaused?.();
            } else if (event.data === YT.PlayerState.ENDED) {
              isPlayingRef.current = false;
              setIsPlayingState(false);
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'none';
              }
              // Release wake lock when ended
              if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
              }
              callbacksRef.current.onEnded?.();
            }
          },
          onError: (event) => {
            if (unmounted) return;
            const code = event.data;
            let msg = `धुन लोड नहीं हो सकी (${code})`;
            if (code === 100 || code === 101 || code === 150) {
              msg = "यह धुन इस समय उपलब्ध नहीं है, अगली धुन शुरू हो रही है...";
            }
            setError(msg);
            callbacksRef.current.onError?.(code);

            // Auto advance on unplayable video
            if (code === 100 || code === 101 || code === 150 || code === 2) {
              if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
              skipTimeoutRef.current = setTimeout(() => {
                callbacksRef.current.onNext?.();
              }, 1800);
            }
          }
        }
      });
    });

    return () => {
      unmounted = true;
      if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
      if (pollInterval) clearInterval(pollInterval);
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (_) {}
        playerRef.current = null;
        isReadyRef.current = false;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      // Release wake lock on cleanup
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []); // Mounts once and lives across songs!

  // Handle videoId switching seamlessly WITHOUT destroying player
  useEffect(() => {
    if (!videoId) {
      setError("YouTube ID अनुपलब्ध है");
      return;
    }

    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = null;
    }
    setError("");
    setCurrentTime(0);

    if (playerRef.current && isReadyRef.current) {
      if (currentVideoIdRef.current !== videoId) {
        currentVideoIdRef.current = videoId;
        try {
          // If already playing or should autoplay, load and play
          if (isPlayingRef.current) {
            playerRef.current.loadVideoById(videoId);
          } else {
            // Load and play immediately for smooth transitions
            playerRef.current.loadVideoById(videoId);
          }
        } catch (e) {
          console.warn("Video load error:", e);
        }
      }
    }
  }, [videoId]);

  // Efficient progress polling ONLY when playing
  useEffect(() => {
    if (!isPlayingState) return;

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        try {
          const cur = playerRef.current.getCurrentTime() || 0;
          const dur = playerRef.current.getDuration() || 0;

          setCurrentTime(cur);
          if (dur > 0) setDuration(dur);

          // Safe MediaSession position state update
          if (
            'mediaSession' in navigator &&
            typeof navigator.mediaSession.setPositionState === 'function' &&
            Number.isFinite(dur) &&
            Number.isFinite(cur) &&
            dur > 0 &&
            cur >= 0 &&
            cur <= dur
          ) {
            try {
              navigator.mediaSession.setPositionState({
                duration: dur,
                playbackRate: 1,
                position: cur
              });
            } catch (_) {}
          }
        } catch (_) {}
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isPlayingState]);

  // Stable memoized control methods
  const play = useCallback(() => {
    try {
      if (playerRef.current && typeof playerRef.current.playVideo === "function") {
        playerRef.current.playVideo();
      }
    } catch (e) {
      console.warn("Play call failed:", e);
    }
  }, []);

  const pause = useCallback(() => {
    try {
      if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn("Pause call failed:", e);
    }
  }, []);

  const seek = useCallback((value) => {
    try {
      const num = Number(value);
      if (Number.isFinite(num) && playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(num, true);
        setCurrentTime(num);
      }
    } catch (e) {
      console.warn("Seek call failed:", e);
    }
  }, []);

  const volume = useCallback((value) => {
    try {
      const vol = Math.max(0, Math.min(100, Math.round(Number(value) * 100)));
      if (playerRef.current && typeof playerRef.current.setVolume === "function") {
        playerRef.current.setVolume(vol);
      }
    } catch (e) {
      console.warn("Volume call failed:", e);
    }
  }, []);

  // Handle page visibility changes for background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden (went to background)
        console.log('Page went to background');
        // Keep playing - don't pause
      } else if (document.visibilityState === 'visible') {
        // Page is visible again
        console.log('Page came to foreground');
        // Ensure player is still in correct state
        if (playerRef.current && playerRef.current.getPlayerState) {
          const state = playerRef.current.getPlayerState();
          console.log('Player state:', state);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    hostRef: containerRef,
    ready,
    duration,
    currentTime,
    error,
    play,
    pause,
    seek,
    volume
  };
}