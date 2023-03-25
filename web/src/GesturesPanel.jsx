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

  return (
    <div className="d-xl-flex justify-content-center">
      <div className="gestures-current gestures-decision gestures-prob w-100">
        <GesturesDecision gestureDecision={props.gestureDecision} />
        <GesturesCurrent gesture={props.gesture} />
        <GesturesLive probs={probs} gestureBuilder={props.gestureBuilder} />
      </div>

      {/* Past Gestures */}
      <div className="gestures-records">
        <GesturesRecords records={records} />
      </div>
    </div>
  );
}
