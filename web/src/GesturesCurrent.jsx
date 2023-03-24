/* Current Gesture (probs below might not exceed threshold) */
export default function GesturesCurrent(props) {
  const results = props.results;
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
          <td>{results && results.gesture.type}</td>
          <td>{results && results.gesture.action}</td>
          <td>{results && results.gesture.value}</td>
        </tr>
      </tbody>
    </table>
  );
}
