export default function GesturesDecision(props) {
  /* GestureDecision State
   * Partial state, waiting for all gestures to build action
   */
  return (
    <table className="table caption-top table-borderless w-100">
      <caption>Gesture Decision</caption>
      <thead>
        <tr>
          <th>Action</th>
          <th>Qty&nbsp;&nbsp;&nbsp;</th>
          <th>Price&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{props.gestureDecision.action}</td>
          <td>{props.gestureDecision.qty}</td>
          <td>{props.gestureDecision.price}</td>
        </tr>
      </tbody>
    </table>
  );
}
