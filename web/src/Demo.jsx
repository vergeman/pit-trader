import { Container, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import MatchingEngineView from "./MatchingEngineView.jsx";
import PlayerManager from "./player/PlayerManager";
import Player from "./player/Player";
import MarketLoop from "./player/MarketLoop";
import GestureDecision from "./input/GestureDecision";
import PlayerStatus from "./PlayerStatus.jsx";
import PlayerOrders from "./PlayerOrders.jsx";

export default function Demo() {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };

  const [gestureData, setGestureData] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [me, setMe] = useState(null);
  const [playerManager, setPlayerManager] = useState(null);
  const [player, setPlayer] = useState(null);
  const [marketLoop, setMarketLoop] = useState(null);
  const [gestureDecision, setGestureDecision] = useState(null);

  useEffect(() => {
    const config = {
      tick: 1000,
      limitPL: -1000000,
    };

    console.log("[Demo.jsx]: useEffect init");
    const landmarks = new Landmarks();
    const classifier = new Classifier(landmarks);
    const me = new MatchingEngine();
    const npcs = [
      new Player("npc-A"),
      new Player("npc-B"),
      new Player("npc-C"),
    ];
    const playerManager = new PlayerManager(me, npcs);
    const player = new Player("test", true, config);
    const marketLoop = new MarketLoop(playerManager, 100);
    const gestureDecision = new GestureDecision(me, marketLoop, player);

    setLandmarks(landmarks);
    setClassifier(classifier);
    setMe(me);
    setPlayerManager(playerManager);
    setPlayer(player);
    setMarketLoop(marketLoop);
    setGestureDecision(gestureDecision);

    classifier.load();
    marketLoop.init();
    marketLoop.run();
  }, []);

  useEffect(() => {
    const gesture = gestureData && gestureData.gesture;
    gestureDecision && gestureDecision.calc(gesture);
  }, [me, player, gestureDecision, gestureData]);

  return (
    <Container className="pt-6" style={{ background: "azure" }}>
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
          <PlayerStatus player={player} marketLoop={marketLoop} />
          <MatchingEngineView me={me} marketLoop={marketLoop} player={player} />
          <PlayerOrders player={player}/>
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
