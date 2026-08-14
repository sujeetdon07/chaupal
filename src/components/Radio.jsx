export default function Radio({ on, onToggle, onChai, onLantern }) {
  return (
    <div className={`radio-wrap ${on ? "radio-on" : ""}`}>
      <button className="radio" onClick={onToggle} aria-label={on ? "रेडियो बंद करें" : "रेडियो चालू करें"}>
        <div className="radio-top"><span className="brand">चौपाल</span><span className="frequency">98.4 FM</span></div>
        <div className="radio-screen"><span className="radio-light" /><span>{on ? "ON AIR" : "OFF AIR"}</span></div>
        <div className="speaker"><span/><span/><span/><span/><span/><span/></div>
        <div className="radio-controls"><i/><i/><b/></div>
      </button>
      <div className="radio-side-actions">
        <button onClick={onLantern} aria-label="लालटेन">✦</button>
        <button onClick={onChai} aria-label="चाय">☕</button>
      </div>
    </div>
  );
}