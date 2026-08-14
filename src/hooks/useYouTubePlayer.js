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

export function useYouTubePlayer({ videoId, onPlaying, onPaused, onEnded, onReady }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
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
        playerRef.current.destroy();
        playerRef.current = null;
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
            }, 100);
          },
          onStateChange: event => {
            if (event.data === YT.PlayerState.PLAYING) onPlaying?.();
            if (event.data === YT.PlayerState.PAUSED) onPaused?.();
            if (event.data === YT.PlayerState.ENDED) onEnded?.();
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
    };
  }, [videoId]);

  useEffect(() => {
    const id = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime() || 0);
        setDuration(playerRef.current.getDuration() || duration);
      }
    }, 500);
    return () => clearInterval(id);
  }, [duration]);

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