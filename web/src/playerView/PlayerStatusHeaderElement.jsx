export default function PlayerStatusHeaderElement(props) {
  return (
    <div
      className={`d-flex flex-column align-items-center ${
        props.className || ""
      }`.trim()}
    >
      <span className={`${props.labelClassName || ""} player-status-label`.trim()}>
        {props.label}
      </span>
      <span className={`${props.valueClassName || ""} player-status-value fs-4`.trim()}>
        {props.value}
      </span>
    </div>
  );
}
