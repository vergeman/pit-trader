/* GestureDecision State
 * Partial state, waiting for all gestures to build action
 */

export default function GesturesDecision(props) {

  //STYLE
  //GestureDecision Styles based on missing/complete values
  //VALUE (vanilla)
  //gestureDeciion.qtyt empty, use gesture

  //LOCKED
  //gestureDecision.qty is locked

  //NEEDED
  //isLocked but no gestureDecision

  //GestureDecisionRecord
  //SUBMITTED style
  //vanilla but..highlighted? fading?

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
        <tr>
          <td>{props.action}</td>
          <td>{props.qty}</td>
          <td>{props.price}</td>
        </tr>
      </tbody>
    </table>
  );
}
