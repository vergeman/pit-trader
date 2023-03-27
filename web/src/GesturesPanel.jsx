import GesturesDecisionRecordFlash from "./GesturesDecisionRecordFlash.jsx";
import GesturesDecision from "./GesturesDecision.jsx";
import GesturesCurrent from "./GesturesCurrent.jsx";
import GesturesLive from "./GesturesLive.jsx";
import GesturesRecords from "./GesturesRecords.jsx";

export default function GesturesPanel(props) {
  if (!props.gestureData) return null;

  const probs = props.gestureData.probs || [];

  const records = props.gestureDecision.records.sort(
    (a, b) => a.timestamp < b.timestamp
  );

  const gestureDecisionRecord = props.gestureDecision.records[0] || {};

  return (
    <div className="d-xl-flex justify-content-center">
      <div className="gestures-current gestures-decision gestures-prob w-100">
        <GesturesDecision
          isDebug={true}
          gestureDecision={props.gestureDecision}
          gesture={props.gesture}
        />
        <GesturesCurrent isDebug={true} gesture={props.gesture} />
        <GesturesLive
          isDebug={true}
          probs={probs}
          gestureBuilder={props.gestureBuilder}
        />
      </div>

      {/* Past Gestures */}
      <div className="gestures-records">
        <GesturesDecisionRecordFlash
          isVisible={props.gestureDecision.isGestureDecisionRecordVisible}
          gestureDecisionRecord={gestureDecisionRecord}
        />
        <GesturesRecords records={records} />
      </div>
    </div>
  );
}
