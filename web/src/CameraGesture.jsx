import { useCallback, useEffect, useState } from "react";
import Camera from "./input/Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import PlayerStatus from "./playerView/PlayerStatus.jsx";
import Classifier from "./gesture/Classifier.js";
import GestureBuilder from "./gesture/GestureBuilder.ts";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import InfoTabs from "./infopanel/InfoTabs.jsx";

export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [gestureBuilder, setGestureBuilder] = useState(null);
  const [gesture, setGesture] = useState(null);
  const infoPanel = useInfoPanel();

  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");
    const gestureBuilder = new GestureBuilder();
    const classifier = new Classifier();

    setGestureBuilder(gestureBuilder);
    setClassifier(classifier);

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
      const probMax = probsArgMax.probs[probsArgMax.argMax];
      const gesture = gestureBuilder.build(probsArgMax.argMax, probMax);

      //calculates gesture and if order is built
      props.gestureDecision.calc(gesture);

      //toggles for draw
      landmarks.setRecognizedGesture(gesture);

      //send any messages populated in calc this calcGesture() pass
      for (let msg of props.gestureDecision.getNewMessages()) {
        infoPanel.messagesDispatch(msg);
      }
      //NB: local gestureDecision msgQueue (not context)
      props.gestureDecision.resetMessages();

      props.triggerGameState();

      setGestureData({ ...probsArgMax, gesture });
      setGesture(gesture);
    },
    [classifier, gestureBuilder]
  );

  //console.log("[CameraGesture] render", gestureData);

  return (
    <>
      <div className="d-grid main-wrapper">
        <div className="camera text-center">
          <Camera
            isActive={true}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            calcGesture={calcGesture}
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
        </div>

        <div className="gestures">
          <GesturesPanel
            gestureData={gestureData}
            gesture={gesture}
            gestureBuilder={gestureBuilder}
            gestureDecision={props.gestureDecision}
          />
        </div>
      </div>

      {/* Tab displays needs to re-render at CameraGesture level */}
      <InfoTabs player={props.player} />
    </>
  );
}
