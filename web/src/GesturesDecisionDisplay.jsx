import GesturesDecision from "./GesturesDecision.jsx";
import GesturesDecisionRecordFlash from "./GesturesDecisionRecordFlash.jsx";

export default function GesturesDecisionDisplay(props) {
  const gestureDecisionRecord = props.gestureDecision.records[0] || {};
  {/* Action: Buy, Sell, Cancel (show) | Garbage (hide) ) */ }
  {/*

             issue: gesture action (buy/sell) isn't passed to gestureDecision - its implied}
             we can test qty to select buy / sell

           */}
  {/* Action: Market */ }
  /*
   * TODO:
   * 0. decide shared display and convert values
   * 1. extract to use same header; just change data
   * 2. <CancelGesture> component

   */
  return (
    <>
      {!props.gestureDecision.isGestureDecisionRecordVisible &&
        <GesturesDecision
          isDebug={true}
          gestureDecision={props.gestureDecision}
          gesture={props.gesture}
        />
      }
      {props.gestureDecision.isGestureDecisionRecordVisible &&
        <GesturesDecisionRecordFlash
          isVisible={props.gestureDecision.isGestureDecisionRecordVisible}
          gestureDecisionRecord={gestureDecisionRecord}
        />
      }
    </>
  );
}
