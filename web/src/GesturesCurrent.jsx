/* Current Gesture (probs below might not exceed threshold) */
export default function GesturesCurrent(props) {
  if (!props.isDebug) return null;

  return (
    <table className="table caption-top table-borderless w-100">
      <caption>Gesture Current</caption>
      <thead>
        <tr>
          <th>Type&nbsp;&nbsp;</th>
          <th>Action</th>
          <th>Value&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.gesture.type}</td>
          <td>{props.gesture.action}</td>
          <td>{props.gesture.value}</td>
        </tr>
      </tbody>
    </table>
  );
}
