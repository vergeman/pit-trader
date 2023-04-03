export default function PlayerStatusHeaderElement(props) {
  return (
    <div className={`d-flex flex-column align-items-center ${props.className || ""}`.trim()}>
      <span className="player-status-label">
        {props.label}
      </span>
      <span className="player-status-value">
        {props.value}
      </span>
    </div>
  );
}