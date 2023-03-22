import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import GestureDecision from "./input/GestureDecision";
import PlayerStatus from "./playerView/PlayerStatus.jsx";
import PlayerOrders from "./playerView/PlayerOrders.jsx";
import LoseModal from "./LoseModal";

export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [gestureDecision, setGestureDecision] = useState(null);

  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");
    const landmarks = new Landmarks();
    const classifier = new Classifier(landmarks);
    const gestureDecision = new GestureDecision(
      props.me,
      props.marketLoop,
      props.player
    );

    setLandmarks(landmarks);
    setClassifier(classifier);
    setGestureDecision(gestureDecision);

    classifier.load();
  }, [props.me, props.player, props.marketLoop]);

  //"iteration" loop triggered by gestureData
  useEffect(() => {
    const gesture = gestureData && gestureData.gesture;
    gestureDecision && gestureDecision.calc(gesture);

    props.checkGameState();
  }, [gestureDecision, gestureData]);

  //TODO: group isLose, runLoopInterval into own hook returns isLose state
  //rename something to usePlayerGameState
  //gameState = run, stop, pause?
  //  should gameState be pushed up to parent??
  //  player + (config), marketLoop + playerManager(me, npcs)
  //  actually might be likely

  //usePlayerLoseState - calculates isLose - since its a hook, only will setLoss if useEffect dependecy changes
  // change this to somethign more robust
  //LostModal - button calls reset(), which will change isLose props
  //useMarketLoopRUnner: toggle loop on / off given isLose - TODO: change to gameState
  //
  const reset = () => {
    //player.reset();
    console.log("reset");
    if (props.player) {
      props.player.orders = [];
      //TODO: need to remove gesture history, orderHistories, etc.
    }
  };

  console.log("[CameraGesture] props.isLose", props.isLose);
  return (
    <Container className="pt-6" style={{ background: "azure" }}>
      <LoseModal isLose={props.isLose} reset={reset} />

      <div className="d-grid main-wrapper">
        <div className="camera">
          <Camera
            isActive={true}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            landmarks={landmarks}
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

      <Row>
        <Col>
          <div className="d-flex justify-content-center">
            News / Alert/ Challenge / Message Component
          </div>
        </Col>
      </Row>
    </Container>
  );
}
