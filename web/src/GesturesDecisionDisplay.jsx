import GesturesDecision from "./GesturesDecision.jsx";
import { RenderState } from "./gesture/GestureDecision";
import { GestureAction } from "./gesture/Gesture";

export default function GesturesDecisionDisplay(props) {
  const gestureDecisionRecord = props.gestureDecision.records[0] || {};

  /*
   * Display Values & Actions
   * helper functions to display action values and prices
   * visually different expectation from what's needed to submit Order.
   */

  const getAction = (gestureDecision) => {
    if (!gestureDecision) return null;

    switch (gestureDecision.action) {
      case GestureAction.Buy:
      case GestureAction.Sell:
      case GestureAction.Cancel:
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
      {props.gestureDecision.renderState == RenderState.GESTURE_DECISION && (
        <GesturesDecision
          renderState={props.gestureDecision.renderState}
          caption="Order Builder"
          action={getAction(props.gestureDecision)}
          qty={props.gestureDecision.qty}
          price={getPrice(props.gestureDecision)}
        />
      )}

      {props.gestureDecision.renderState ==
        RenderState.GESTURE_DECISION_RECORD && (
        <GesturesDecision
          renderState={props.gestureDecision.renderState}
          caption="Order Builder"
          action={getAction(gestureDecisionRecord)}
          qty={gestureDecisionRecord.qty}
          price={getPrice(gestureDecisionRecord)}
          actionOnly={getAction(gestureDecisionRecord) == GestureAction.Cancel}
        />
      )}

      {/*
       * Gesture Clear (not order)
       * clear and send blank text to avoid confusion of different cancel types to user
       */}
      {props.gestureDecision.renderState == RenderState.GESTURE_CANCEL && (
        <GesturesDecision
          renderState={props.gestureDecision.renderState}
          caption="Order Builder"
          action={""}
        />
      )}
    </>
  );
}
