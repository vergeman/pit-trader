export default function PlayerStatusHeaderElement(props) {
  return (
    <div
      className={`d-flex flex-column align-items-center ${
        props.className || ""
      }`.trim()}
    >
      <span className={`${props.labelClassName} player-status-label`}>
        {props.label}
      </span>
      <span className={`${props.valueClassName} player-status-value fs-4`}>
        {props.value}
      </span>
    </div>
  );
}
