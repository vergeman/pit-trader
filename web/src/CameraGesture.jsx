import { useCallback, useEffect, useState, useRef } from "react";
import Camera from "./input/Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import GestureDecision from "./gesture/GestureDecision";
import PlayerStatus from "./playerView/PlayerStatus.jsx";
import PlayerOrders from "./playerView/PlayerOrders.jsx";
import Classifier from "./gesture/Classifier.js";
import GestureBuilder from "./gesture/GestureBuilder.ts";

export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [gestureBuilder, setGestureBuilder] = useState(null);
  const [gesture, setGesture] = useState(null);
  const gestureDecisionRef = useRef(null); //fix for stale closure

  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");
    const gestureBuilder = new GestureBuilder();
    const classifier = new Classifier();
    const gestureDecision = new GestureDecision(
      props.me,
      props.marketLoop,
      props.player
    );

    setGestureBuilder(gestureBuilder);
    setClassifier(classifier);
    gestureDecisionRef.current = gestureDecision;

    gestureBuilder.load().then(() => {
      classifier.load(gestureBuilder.garbage_idx);
    });
  }, [props.me, props.player, props.marketLoop]);

  const calcGesture = useCallback(
    async (landmarks) => {
      //NB: useCallback ensures React.memo works (execute signature will regen on this
      //comonent render)

      if (!classifier) return null;

      const probsArgMax = await classifier.classify(landmarks);
      const gesture = gestureBuilder.build(probsArgMax.argMax);

      //stale closure
      gestureDecisionRef.current.calc(gesture);

      props.triggerGameState(gestureDecisionRef.current);

      setGestureData({ ...probsArgMax, gesture });
      setGesture(gesture);
    },
    [classifier, gestureDecisionRef, gestureBuilder]
  );

  console.log("[CameraGesture] render", gestureData);

  return (
    <>
      <div className="d-grid main-wrapper">
        <div className="camera">
          <Camera
            isActive={true}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            calcGesture={calcGesture}
          />
        </div>

        <div className="gestures">
          Gestures
          <GesturesPanel
            gestureData={gestureData}
            gesture={gesture}
            gestureBuilder={gestureBuilder}
            gestureDecision={gestureDecisionRef.current}
          />
        </div>

        {/*NB: views needs to be updated per iteration */}
        <div className="me">
          <PlayerStatus player={props.player} marketLoop={props.marketLoop} />
          <MatchingEngineView
            me={props.me}
            marketLoop={props.marketLoop}
            player={props.player}
          />
          <PlayerOrders player={props.player} />
        </div>
      </div>
    </>
  );
}
