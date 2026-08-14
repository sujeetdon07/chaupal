import { useEffect, useState } from "react";
import Scene from "./components/Scene";
import YouTubePlayer from "./components/YouTubePlayer";
import Timer from "./components/Timer";
import SourceLinks from "./components/SourceLinks";
import { songs } from "./data/songs";
import { useTimer } from "./hooks/useTimer";

export default function App() {
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [atmosphere, setAtmosphere] = useState("evening");
  const [lantern, setLantern] = useState(false);
  const [chai, setChai] = useState(false);
  const [welcome, setWelcome] = useState(true);
  const [online, setOnline] = useState(33);
  const { seconds, running, start, stop } = useTimer();

  const song = songs[songIndex];
  const next = () => {
    setSongIndex(i => (i + 1) % songs.length);
    setIsPlaying(true); // Auto-play next song
  };
  const prev = () => {
    setSongIndex(i => (i - 1 + songs.length) % songs.length);
    setIsPlaying(true); // Auto-play previous song
  };

  useEffect(() => {
    const id = setTimeout(() => setWelcome(false), 1000);
    return () => clearTimeout(id);
  }, []);

  // Gentle live-room illusion for a static frontend demo.
  useEffect(() => {
    const id = setInterval(() => {
      setOnline(n => Math.max(24, Math.min(47, n + (Math.random() > 0.52 ? 1 : -1))));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (running && seconds === 0) setIsPlaying(false);
  }, [running, seconds]);

  return (
    <main className={`app ${atmosphere}`}>
      <Scene
        atmosphere={atmosphere}
        lantern={lantern}
        chai={chai}
        onToggleAtmosphere={() => setAtmosphere(a => a === "evening" ? "night" : "evening")}
      />

      <header className="topbar">
        <div className="clock">
          <strong>{new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</strong>
          <span>भारत के गाँव से</span>
        </div>

        <div className="live-count" aria-label={`${online} लोग ऑनलाइन हैं`}>
          <i /> <b>{online}</b> <span>online</span>
        </div>

        <SourceLinks />
      </header>

      <section className="hero">
        <p className="eyebrow">मिट्टी की खुशबू · देसी धुन · सुकून</p>
        <h1>चौपाल<br /><em>सुन</em></h1>
        <p>जहाँ शाम रुकती है, धुनें चलती हैं।</p>
      </section>

      <div className="vibe-note">
        <span className="pulse-dot" />
        अभी महफ़िल चल रही है
      </div>

      <section className="bottom-ui">
        <YouTubePlayer
          song={song}
          songs={songs}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          onNext={next}
          onPrev={prev}
          onSelect={setSongIndex}
        />
        <Timer seconds={seconds} running={running} start={start} stop={stop} />
      </section>

      <button
        className="theme-tip"
        onClick={() => setAtmosphere(a => a === "evening" ? "night" : "evening")}
      >
        {atmosphere === "evening" ? "☾ रात की चौपाल" : "☀ साँझ की चौपाल"}
      </button>

      {welcome && (
        <div className="welcome">
          <div>
            <small>गाँव का रेडियो</small>
            <h2>चौपाल</h2>
            <p>एक मिनट बैठिए...</p>
          </div>
        </div>
      )}
      <footer>मन की थकान यहीं रख जाइए।</footer>

      <div className="watermark">
        Made with <span>♥</span> by Sujeet Kumar
      </div>
    </main>
  );
}
