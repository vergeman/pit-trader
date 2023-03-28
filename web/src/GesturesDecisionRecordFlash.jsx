export default function GesturesDecisionRecordFlash(props) {
  return (
    <table className="table caption-top table-borderless w-100">
      <caption>Gesture Decision Flash</caption>
      <thead>
        <tr>
          <th>Action</th>
          <th>Qty&nbsp;&nbsp;&nbsp;</th>
          <th>Price&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        <tr className={props.isVisible ? "visible" : "invisible"}>
          <td>{props.gestureDecisionRecord.action}</td>
          <td>{props.gestureDecisionRecord.qty}</td>
          <td>{props.gestureDecisionRecord.price}</td>
        </tr>
      </tbody>
    </table>
  );
}
