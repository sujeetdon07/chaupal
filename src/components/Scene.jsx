export default function Scene({
  atmosphere,
  lantern,
  chai,
  onToggleLantern,
  onToggleChai,
  onToggleAtmosphere
}) {
  return (
    <div className={`scene ${atmosphere} ${lantern ? "lantern-bright" : ""}`}>
      <div className="sun" aria-hidden="true" />
      <div className="moon" aria-hidden="true" />
      <div className="stars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="cloud cloud-a" aria-hidden="true" />
      <div className="cloud cloud-b" aria-hidden="true" />
      <div className="distant-huts" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <div className="tree tree-left" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="tree tree-right" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="field field-back" aria-hidden="true" />
      <div className="field field-front" aria-hidden="true" />
      <div className="village-group">
        <div className="person person-one" aria-hidden="true"><span className="head" /><span className="body" /></div>
        <div className="person person-two" aria-hidden="true"><span className="head" /><span className="body" /></div>
        <div className="person person-three" aria-hidden="true"><span className="head" /><span className="body" /></div>
        <div className="charpai" aria-hidden="true"><i /><i /><i /><i /></div>
        
        {/* Interactive Lantern */}
        <button
          type="button"
          className={`lantern-btn lantern ${lantern ? "bright" : ""}`}
          onClick={onToggleLantern}
          title={lantern ? "लालटेन धीमी करें" : "लालटेन जलाएँ"}
          aria-label={lantern ? "लालटेन धीमी करें" : "लालटेन जलाएँ"}
        />

        {/* Interactive Chai cup */}
        <button
          type="button"
          className={`chai-btn chai ${chai ? "steaming" : ""}`}
          onClick={onToggleChai}
          title={chai ? "गरम चाय की भाप बंद करें" : "गरम चाय की चुस्की लें"}
          aria-label={chai ? "गरम चाय की भाप बंद करें" : "गरम चाय की चुस्की लें"}
        >
          <span />
        </button>
      </div>
      <div className="grain" aria-hidden="true" />
    </div>
  );
}