export default function PlayerStatusHeaderElement(props) {
  return (
    <div className="d-flex flex-column align-items-center">
      <span className="player-status-label fs-7 text-secondary">
        {props.label}
      </span>
      <span className="player-status-value fs-5">
        {props.value}
      </span>
    </div>
  );
}