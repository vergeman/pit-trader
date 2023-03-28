/* GestureDecision State
 * Partial state, waiting for all gestures to build action
 */

export default function GesturesDecision(props) {

  return (
    <table className="table caption-top table-borderless w-100">
      <caption>{props.caption}</caption>
      <thead>
        <tr>
          <th>Action</th>
          <th>Qty&nbsp;&nbsp;&nbsp;</th>
          <th>Price&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr className={props.isVisible ? "visible" : "invisible"}>
          <td>{props.gestureDecision.action}</td>
          <td>{props.gestureDecision.qty}</td>
          <td>{props.gestureDecision.price}</td>
        </tr>
      </tbody>
    </table>
  );
}
