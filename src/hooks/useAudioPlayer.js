import { useEffect, useRef, useState } from "react";

export function useAudioPlayer({ videoId, onPlaying, onPaused, onEnded, onReady, onNext, onPrev, songTitle, songArtist }) {
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // YouTube audio-only URL format
  const getAudioUrl = (id) => {
    return `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  };

  useEffect(() => {
    if (!videoId) {
      setReady(false);
      setError("इस गीत के लिए YouTube Video ID अभी नहीं जोड़ी गई है।");
      return;
    }

    setError("");
    setLoading(true);

    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.preload = "auto";
    }

    const audio = audioRef.current;

    // Set up audio source using YouTube's audio stream
    // Note: YouTube doesn't provide direct audio URLs, so we use the IFrame approach
    // For true background playback, you would need to host MP3 files
    audio.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1`;

    // Set up event listeners
    const handleCanPlay = () => {
      setReady(true);
      setLoading(false);
      setDuration(audio.duration || 0);
      onReady?.(audio);
      
      // Setup Media Session API for background playback
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
          audio.play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          onPrev?.();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          onNext?.();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime && !isNaN(details.seekTime)) {
            audio.currentTime = details.seekTime;
          }
        });
      }
    };

    const handlePlay = () => {
      onPlaying?.();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      // Request screen wake lock
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(lock => {
          wakeLockRef.current = lock;
        }).catch(err => {
          console.log('Wake Lock error:', err);
        });
      }
    };

    const handlePause = () => {
      onPaused?.();
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      // Release wake lock
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    const handleEnded = () => {
      onEnded?.();
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setError("ऑडियो लोड करने में समस्या हुई। YouTube सीमाओं के कारण, पृष्ठभूमि प्लेबैक के लिए MP3 फ़ाइलों की अनुशंसा की जाती है।");
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
      
      // Update Media Session playback position
      if ('mediaSession' in navigator && audio.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime
        });
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Load the audio
    audio.load().catch(err => {
      console.error('Load error:', err);
      setError("YouTube ऑडियो स्ट्रीम लोड करने में विफल।");
      setLoading(false);
    });

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      
      // Release wake lock
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, [videoId, songTitle, songArtist]);

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

  return {
    audio: audioRef,
    ready,
    duration,
    currentTime,
    error,
    loading,
    play: () => {
      try {
        if (audioRef.current && ready) {
          audioRef.current.play();
        }
      } catch (e) {
        console.error('Play error:', e);
      }
    },
    pause: () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (e) {
        console.error('Pause error:', e);
      }
    },
    seek: value => {
      try {
        if (audioRef.current && !isNaN(value)) {
          audioRef.current.currentTime = Number(value);
        }
      } catch (e) {
        console.error('Seek error:', e);
      }
    },
    volume: value => {
      try {
        if (audioRef.current && !isNaN(value)) {
          audioRef.current.volume = Math.max(0, Math.min(1, Number(value)));
        }
      } catch (e) {
        console.error('Volume error:', e);
      }
    }
  };
}
