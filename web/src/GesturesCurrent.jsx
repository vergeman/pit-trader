/* Current Gesture (probs below might not exceed threshold) */
export default function GesturesCurrent(props) {
  if (!props.isDebug) return null;

  const tableStyle = {
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    transform: 'translate3d(0, 0, 0)',
    width: '400px',
    textAlign: 'center',
    margin: '1rem auto',
    marginTop: '-2rem',
    fontSize: '1rem',
  };

  const type = props.gesture.type == "Action" ? '' : props.gesture.type;
  const action = props.gesture.action == "Garbage" ? '' : props.gesture.action;

  return (
    <table className="table table-sm table-bordered caption-top" style={tableStyle}>
      <thead>
        <tr>
          <th>Type&nbsp;&nbsp;</th>
          <th>Action</th>
          <th>Value&nbsp;</th>
          <th>Prob&nbsp;&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{type || "-"}</td>
          <td>{action}</td>
          <td>{props.gesture.value}</td>
          <td>{props.gesture.value && props.gesture.prob}</td>
        </tr>
      </tbody>
    </table>
  );
}
