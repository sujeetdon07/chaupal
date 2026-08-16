import { useEffect, useRef, useState } from "react";

let apiPromise;

function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise(resolve => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return apiPromise;
}

export function useYouTubePlayer({ videoId, onPlaying, onPaused, onEnded, onReady, onNext, onPrev, songTitle, songArtist }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!videoId) {
      setReady(false);
      setError("इस गीत के लिए YouTube Video ID अभी नहीं जोड़ी गई है।");
      return;
    }

    setError("");
    loadYouTubeAPI().then(YT => {
      if (cancelled || !hostRef.current) return;

      if (playerRef.current) {
        // If player already exists, just load the new video
        playerRef.current.loadVideoById(videoId);
        return;
      }

      playerRef.current = new YT.Player(hostRef.current, {
        width: "200",
        height: "200",
        videoId,
        playerVars: {
          playsinline: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: event => {
            // Add small delay to ensure player is truly ready
            setTimeout(() => {
              setReady(true);
              setDuration(event.target.getDuration() || 0);
              onReady?.(event.target);
              
              // Setup Media Session API for background playback and lock screen controls
              if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                  title: songTitle || 'Unknown',
                  artist: songArtist || 'Unknown Artist',
                  album: 'चौपाल रेडियो',
                  artwork: [
                    { src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
                    { src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, sizes: '1280x720', type: 'image/jpeg' }
                  ]
                });

                navigator.mediaSession.setActionHandler('play', () => {
                  event.target.playVideo();
                });

                navigator.mediaSession.setActionHandler('pause', () => {
                  event.target.pauseVideo();
                });

                navigator.mediaSession.setActionHandler('previoustrack', () => {
                  onPrev?.();
                });

                navigator.mediaSession.setActionHandler('nexttrack', () => {
                  onNext?.();
                });
              }
            }, 100);
          },
          onStateChange: event => {
            if (event.data === YT.PlayerState.PLAYING) {
              onPlaying?.();
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
            }
            if (event.data === YT.PlayerState.PAUSED) {
              onPaused?.();
              if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
              }
              // Release wake lock when paused
              if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
              }
            }
            if (event.data === YT.PlayerState.ENDED) {
              onEnded?.();
              // Release wake lock when ended
              if (wakeLockRef.current) {
                wakeLockRef.current.release();
                wakeLockRef.current = null;
              }
            }
          },
          onError: event => {
            setError(`YouTube player error (${event.data}). Check the video ID/embed availability.`);
          }
        }
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      // Release wake lock on cleanup
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [videoId]);

  // Update Media Session metadata when song changes
  useEffect(() => {
    if ('mediaSession' in navigator && songTitle && songArtist) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songTitle || 'Unknown',
        artist: songArtist || 'Unknown Artist',
        album: 'चौपाल रेडियो',
        artwork: [
          { src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, sizes: '480x360', type: 'image/jpeg' },
          { src: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, sizes: '1280x720', type: 'image/jpeg' }
        ]
      });
    }
  }, [songTitle, songArtist, videoId]);

  useEffect(() => {
    const id = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        setCurrentTime(currentTime);
        setDuration(playerRef.current.getDuration() || duration);
        
        // Update Media Session playback position
        if ('mediaSession' in navigator && duration > 0) {
          navigator.mediaSession.setPositionState({
            duration: duration,
            playbackRate: 1,
            position: currentTime
          });
        }
      }
    }, 500);
    return () => clearInterval(id);
  }, [duration]);

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
    hostRef,
    player: playerRef,
    ready,
    duration,
    currentTime,
    error,
    play: () => {
      try {
        if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch (e) {
        console.error('Play error:', e);
      }
    },
    pause: () => {
      try {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        console.error('Pause error:', e);
      }
    },
    seek: value => {
      try {
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
          playerRef.current.seekTo(Number(value), true);
        }
      } catch (e) {
        console.error('Seek error:', e);
      }
    },
    volume: value => {
      try {
        if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(Math.round(Number(value) * 100));
        }
      } catch (e) {
        console.error('Volume error:', e);
      }
    }
  };
}