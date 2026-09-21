import { useEffect, useState, useCallback, useRef } from "react";
import Scene from "./components/Scene";
import YouTubePlayer from "./components/YouTubePlayer";
import SourceLinks from "./components/SourceLinks";
import { songs } from "./data/songs";
import { useTimer } from "./hooks/useTimer";

function getStored(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch (_) {
    return fallback;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, String(val));
  } catch (_) {}
}

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [atmosphere, setAtmosphere] = useState(() => getStored("chaupal_atmo", "evening"));
  const [volume, setVolume] = useState(() => Number(getStored("chaupal_vol", 0.72)));
  const [prevVolume, setPrevVolume] = useState(0.72);
  const [lantern, setLantern] = useState(false);
  const [chai, setChai] = useState(false);
  const [welcome, setWelcome] = useState(true);
  const [online, setOnline] = useState(33);
  const [shuffle, setShuffle] = useState(() => getStored("chaupal_shuf", "false") === "true");
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
  );

  const { seconds, running, start, stop } = useTimer();
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const song = songs[songIndex] || songs[0];

  const getRandomIndex = useCallback((currentIndex) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * songs.length);
    } while (newIndex === currentIndex && songs.length > 1);
    return newIndex;
  }, []);

  const next = useCallback(() => {
    setSongIndex((cur) => {
      if (shuffle) return getRandomIndex(cur);
      return (cur + 1) % songs.length;
    });
    setIsPlaying(true);
  }, [shuffle, getRandomIndex]);

  const prev = useCallback(() => {
    setSongIndex((cur) => {
      if (shuffle) return getRandomIndex(cur);
      return (cur - 1 + songs.length) % songs.length;
    });
    setIsPlaying(true);
  }, [shuffle, getRandomIndex]);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const nextVal = !s;
      setStored("chaupal_shuf", nextVal);
      return nextVal;
    });
  }, []);

  const handleVolumeChange = useCallback((newVol) => {
    setVolume(newVol);
    setStored("chaupal_vol", newVol);
  }, []);

  const toggleAtmosphere = useCallback(() => {
    setAtmosphere((a) => {
      const nextAtmo = a === "evening" ? "night" : "evening";
      setStored("chaupal_atmo", nextAtmo);
      return nextAtmo;
    });
  }, []);

  // Keyboard Shortcuts (Space, Arrows, M, S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setVolume((v) => {
          if (v > 0) {
            setPrevVolume(v);
            handleVolumeChange(0);
            return 0;
          } else {
            const restored = prevVolume > 0 ? prevVolume : 0.72;
            handleVolumeChange(restored);
            return restored;
          }
        });
      } else if (e.code === "KeyS") {
        e.preventDefault();
        toggleShuffle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, toggleShuffle, handleVolumeChange, prevVolume]);

  // Village clock updates accurately every 10 seconds
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      );
    };

    const id = setInterval(updateTime, 10000);
    return () => clearInterval(id);
  }, []);

  // Welcome banner fadeout
  useEffect(() => {
    const id = setTimeout(() => setWelcome(false), 800);
    return () => clearTimeout(id);
  }, []);

  // Gentle live listener fluctuation
  useEffect(() => {
    const id = setInterval(() => {
      setOnline((n) => Math.max(24, Math.min(47, n + (Math.random() > 0.52 ? 1 : -1))));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Stop music when focus timer completes
  useEffect(() => {
    if (running && seconds === 0) {
      setIsPlaying(false);
    }
  }, [running, seconds]);

  return (
    <main className={`app ${atmosphere}`}>
      <Scene
        atmosphere={atmosphere}
        lantern={lantern}
        chai={chai}
        onToggleLantern={() => setLantern((l) => !l)}
        onToggleChai={() => setChai((c) => !c)}
        onToggleAtmosphere={toggleAtmosphere}
      />

      <header className="topbar">
        <div className="clock">
          <strong>{currentTimeStr}</strong>
          <span>भारत के गाँव से</span>
        </div>

        <div className="live-badge" aria-label={`${online} लोग ऑनलाइन हैं`}>
          <span className="pulse-dot" />
          <span>महफ़िल जारी है</span>
          <span className="live-dot-sep">·</span>
          <b>{online}</b>
          <small>online</small>
        </div>

        <SourceLinks />
      </header>

      {/* Harmoniously positioned Masthead in the Upper Sky */}
      <section className="hero">
        <p className="eyebrow">मिट्टी की खुशबू · देसी धुन · सुकून</p>
        <h1 className="brand-title">चौपाल</h1>
        <p className="tagline">जहाँ शाम रुकती है, धुनें चलती हैं।</p>
      </section>

      {/* Unified Audio & Timer Console */}
      <section className="bottom-ui">
        <YouTubePlayer
          song={song}
          songs={songs}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={next}
          onPrev={prev}
          onSelect={setSongIndex}
          shuffle={shuffle}
          onToggleShuffle={toggleShuffle}
          currentVolume={volume}
          onVolumeChange={handleVolumeChange}
          timerSeconds={seconds}
          timerRunning={running}
          onStartTimer={start}
          onStopTimer={stop}
        />
      </section>

      {/* Bottom Bar: Ambient Quote, Watermark, and Theme Toggle */}
      <footer className="screen-footer">
        <div className="footer-quote">मन की थकान यहीं रख जाइए।</div>

        <div className="watermark">
          Made with <span>♥</span> by Sujeet Kumar
        </div>

        <button
          type="button"
          className="theme-tip"
          onClick={toggleAtmosphere}
          title="वातावरण बदलें (साँझ / रात)"
        >
          {atmosphere === "evening" ? "☾ रात की चौपाल" : "☀ साँझ की चौपाल"}
        </button>
      </footer>

      {welcome && (
        <div className="welcome">
          <div>
            <small>गाँव का रेडियो</small>
            <h2>चौपाल</h2>
            <p>एक मिनट बैठिए...</p>
          </div>
        </div>
      )}
    </main>
  );
}
