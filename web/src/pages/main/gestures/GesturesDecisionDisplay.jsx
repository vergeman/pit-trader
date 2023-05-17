import GesturesDecision from "./GesturesDecision.jsx";
import { RenderState, GestureAction } from "../../../lib/gesture";

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
      case GestureAction.BUY:
      case GestureAction.SELL:
      case GestureAction.CANCEL:
        return gestureDecision.action;

      case GestureAction.NONE:
      case GestureAction.MARKET:
        if (gestureDecision.qty > 0) {
          return GestureAction.BUY;
        }
        if (gestureDecision.qty < 0) {
          return GestureAction.SELL;
        }

      default:
        return null;
    }
  };

  const getPrice = (gestureDecision) => {
    if (!gestureDecision) return null;

    if (gestureDecision.action == GestureAction.MARKET) {
      return GestureAction.MARKET;
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
          actionOnly={getAction(gestureDecisionRecord) == GestureAction.CANCEL}
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
