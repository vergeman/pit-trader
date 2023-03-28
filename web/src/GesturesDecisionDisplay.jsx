import GesturesDecision from "./GesturesDecision.jsx";
import {GestureAction} from "./gesture/Gesture";

export default function GesturesDecisionDisplay(props) {
  const gestureDecisionRecord = props.gestureDecision.records[0] || {};

  /* Action: Buy, Sell, Cancel (show) | Garbage (hide) )
   * issue: gesture action (buy/sell) isn't passed to gestureDecision - its implied}
   * we can test qty to select buy / sell
   * Action: Market
   *
   * TODO:
   * 0. decide shared display and convert values
   * 2. <CancelGesture> component
   *
   */

  //VALUES
  // action: [buy/sell] on qty or record
  // action Market -> price
  // action Cancel -> not sure
  // qty: number
  // price: number | MARKET

  const getAction = (gestureDecision) => {
    if (!gestureDecision) return null;

    switch (gestureDecision.action) {

      case GestureAction.Buy:
      case GestureAction.Sell:
        return gestureDecision.action;

      case GestureAction.None:
      case GestureAction.Market:
        if (gestureDecision.qty > 0) {
          return GestureAction.Buy;
        }
        if (gestureDecision.qty < 0) {
          return GestureAction.Sell;
        }

      default:
        return null;
    }

    //TODO: not sure here but want some indicator
    // not an order cancel but a gesture cancel
    // if (action == GestureAction.Cancel) {
    //   return null;
    // }
  };

  const getPrice = (gestureDecision) => {
    if (!gestureDecision) return null;

    if (gestureDecision.action == GestureAction.Market) {
      return GestureAction.Market;
    }
    return gestureDecision.price;
  };

  return (
    <>
      {!props.gestureDecision.isGestureDecisionRecordVisible && (
        <GesturesDecision
          isVisible={!props.gestureDecision.isGestureDecisionRecordVisible}
          caption="Gesture Decision"
          action={getAction(props.gestureDecision)}
          qty={props.gestureDecision.qty}
          price={getPrice(props.gestureDecision.price)}
        />
      )}

      {props.gestureDecision.isGestureDecisionRecordVisible && (
        <GesturesDecision
          isVisible={props.gestureDecision.isGestureDecisionRecordVisible}
          caption="Gesture Decision Flash"
          action={getAction(gestureDecisionRecord)}
          qty={gestureDecisionRecord.qty}
          price={getPrice(gestureDecisionRecord)}
        />
      )}
    </>
  );
}
