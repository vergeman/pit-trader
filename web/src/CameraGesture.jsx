import { useEffect, useState } from "react";
import Camera from "./input/Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import GestureDecision from "./gesture/GestureDecision";
import PlayerStatus from "./playerView/PlayerStatus.jsx";
import PlayerOrders from "./playerView/PlayerOrders.jsx";
import Classifier from "./gesture/Classifier.js";

export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [gestureDecision, setGestureDecision] = useState(null);
  const [classifier, setClassifier] = useState(null);

  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");

    const classifier = new Classifier();
    const gestureDecision = new GestureDecision(
      props.me,
      props.marketLoop,
      props.player
    );

    setClassifier(classifier);
    setGestureDecision(gestureDecision);
    classifier.load();

  }, [props.me, props.player, props.marketLoop]);

  //"iteration" loop triggered by gestureData
  useEffect(() => {
    const gesture = gestureData && gestureData.gesture;
    gestureDecision && gestureDecision.calc(gesture);

    props.triggerGameState(gestureDecision);
  }, [gestureDecision, gestureData]);

  return (
    <>
      <div className="d-grid main-wrapper">
        <div className="camera">
          <Camera
            isActive={true}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            classifier={classifier}
            setGestureData={setGestureData}
          />
        </div>

        <div className="gestures">
          Gestures
          <GesturesPanel
            results={gestureData}
            gestureBuilder={classifier && classifier.gestureBuilder}
            gestureDecision={gestureDecision}
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
