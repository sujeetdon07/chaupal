export default function Scene({ atmosphere, lantern, chai, onToggleAtmosphere }) {
  return (
    <div className={`scene ${atmosphere} ${lantern ? "lantern-bright" : ""}`}>
      <div className="sun"/><div className="moon"/>
      <div className="stars"><i/><i/><i/><i/><i/><i/><i/></div>
      <div className="cloud cloud-a"/><div className="cloud cloud-b"/>
      <div className="distant-huts"><i/><i/><i/><i/></div>
      <div className="tree tree-left"><span/><span/><span/></div><div className="tree tree-right"><span/><span/><span/></div>
      <div className="field field-back"/><div className="field field-front"/>
      <div className="village-group">
        <div className="person person-one"><span className="head"/><span className="body"/></div>
        <div className="person person-two"><span className="head"/><span className="body"/></div>
        <div className="person person-three"><span className="head"/><span className="body"/></div>
        <div className="charpai"><i/><i/><i/><i/></div>
        <div className={`lantern ${lantern ? "bright" : ""}`}/>
        <div className={`chai ${chai ? "steaming" : ""}`}><span/></div>
      </div>
      {/* <button className="atmosphere-switch" onClick={onToggleAtmosphere}>
        {atmosphere === "evening" ? "रात कर दें →" : "साँझ वापस लाएँ →"}
      </button> */}
      <div className="grain"/>
    </div>
  );
}