import GesturesDecisionDisplay from "./GesturesDecisionDisplay.jsx";
import GesturesCurrent from "./GesturesCurrent.jsx";
import GesturesLive from "./GesturesLive.jsx";
import GesturesRecords from "./GesturesRecords.jsx";
import { useGameContext } from "./components/GameContext.jsx";

export default function GesturesPanel(props) {
  const gameContext = useGameContext();

  if (!props.gestureData) return null;

  const probs = props.gestureData.probs || [];

  const records = props.gestureDecision.records.sort(
    (a, b) => a.timestamp < b.timestamp
  );

  return (
    <div className="d-xl-flex justify-content-center">
      <div className="gestures-current gestures-decision gestures-prob w-100">
        <GesturesCurrent
          isDebug={gameContext.isDebug}
          gesture={props.gesture}
        />
        <GesturesDecisionDisplay
          gestureDecision={props.gestureDecision}
          gesture={props.gesture}
        />
      </div>

      {/* Live Debug Probs & Past Gestures */}
      <div className="gestures-records">
        <GesturesLive
          isDebug={gameContext.isDebug}
          hasHands={props.gestureData.hasHands}
          probs={probs}
          gestureBuilder={props.gestureBuilder}
        />
        <GesturesRecords isDebug={gameContext.isDebug} records={records} />
      </div>
    </div>
  );
}
