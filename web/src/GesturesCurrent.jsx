/* Current Gesture (probs below might not exceed threshold) */
export default function GesturesCurrent(props) {
  if (!props.isDebug) return null;

  const type = props.gesture.type == "Action" ? '' : props.gesture.type;
  const action = props.gesture.action == "Garbage" ? '' : props.gesture.action;

  return (
    <table id="gestureCurrent" className="table table-sm table-bordered mt-md-n4">
      <caption>Gesture</caption>
      {/* <thead> */}
      {/*   <tr> */}
      {/*     <th>Type&nbsp;&nbsp;</th> */}
      {/*     <th>Action</th> */}
      {/*     <th>Value&nbsp;</th> */}
      {/*     {/\* <th>Prob&nbsp;&nbsp;</th> *\/} */}
      {/*   </tr> */}
      {/* </thead> */}
      <tbody>
        <tr>
          <td>{type}</td>
          <td>{action || "-"}</td>
    <td>{props.gesture.value ? Math.abs(props.gesture.value) : null}</td>
          {/* <td>{props.gesture.value && props.gesture.prob}</td> */}
        </tr>
      </tbody>
    </table>
  );
}
