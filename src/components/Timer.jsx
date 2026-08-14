export default function Timer({ seconds, running, start, stop }) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return (
    <div className="timer">
      <div className="timer-heading"><span>थोड़ा ठहरिए</span>{running && <strong>{m}:{s}</strong>}</div>
      <div className="timer-buttons">
        {[15,25,45].map(min => <button key={min} className={running && seconds === min*60 ? "active":""} onClick={() => start(min)}>{min} <small>मिनट</small></button>)}
        {running && <button className="stop-timer" onClick={stop}>रोकें</button>}
      </div>
    </div>
  );
}