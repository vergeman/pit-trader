import { GestureAction } from "./lib/gesture/Gesture";
import { RenderState } from "./lib/gesture/GestureDecision";
/* GestureDecision State
 * Partial state, waiting for all gestures to build action
 */

export default function GesturesDecision(props) {
  /*
   * GestureDecision StyleClass
   *
   * so far these are considered to be singular, mutual exclusive states per
   * cell
   *
   * when building Order add style classes to denote what gestures remain to
   * submit complete order: is-needed, is-locked
   *
   * other style classes indicate submission or cancellation of order
   * is-submitted uses (GestureDecisionRecord)
   * is-cancel-order: a submitted order was cancelled
   * is-cancel-gesture: a gesture decision was cleared (order halfway built)
   *
   */

  const StyleClass = {
    CANCELGESTURE: "is-cancel-gesture",
    CANCELORDER: "is-cancel-order",
    SUBMITTED: "is-submitted",
    LOCKED: "is-locked",
    NEEDED: "is-needed",
  };

  const calcStyleClass = (props) => {
    if (
      props.renderState === RenderState.GESTURE_CANCEL &&
      props.action === GestureAction.CANCEL
    ) {
      return StyleClass.CANCELGESTURE;
    }

    if (props.action === GestureAction.CANCEL) {
      return StyleClass.CANCELORDER;
    }

    if (props.qty && props.price && props.value) {
      return StyleClass.SUBMITTED;
    }

    if (
      (props.qty && props.qty === props.value) ||
      (props.qty && props.action === props.value) ||
      (props.price && props.price === props.value)
    ) {
      return StyleClass.LOCKED;
    }
    if ((!props.qty && props.price) || (!props.price && props.qty)) {
      return StyleClass.NEEDED;
    }

    return "";
  };

  function TableDataCell(props) {
    const styleClass = calcStyleClass(props);
    const displayValue = props.value || "\u00A0";
    return (
      <td className={`${styleClass} bg-transparent`}>
        {displayValue}
      </td>
    );
  }

  //Note: not sure where to style, but want indicators for now
  return (
    <table id="gestureDecision" className="table table-sm w-100 text-center">
      <caption className="text-center">{props.caption}</caption>
      <tbody>
        <tr>
          <TableDataCell {...props} value={props.action} />
          {
            !props.actionOnly &&
            <>
              <TableDataCell {...props} value={props.qty} />
              <TableDataCell {...props} value={props.price} />
            </>
          }
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th className={calcStyleClass({ ...props, value: props.action })}>
            Action
          </th>
          {!props.actionOnly &&
            <>
              <th className={calcStyleClass({ ...props, value: props.qty })}>
                Qty
              </th>
              <th className={calcStyleClass({ ...props, value: props.price })}>
                Price
              </th>
            </>
          }
        </tr>
      </tfoot>
    </table>
  );
}
