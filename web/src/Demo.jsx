import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import MatchingEngineView from "./MatchingEngineView.jsx";
import PlayerManager from "./player/PlayerManager";
import Player from "./player/Player";
import MarketLoop from "./player/MarketLoop";

export default function Demo() {
  const [gestureData, setGestureData] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [me, setMe] = useState(null);
  const [playerManager, setPlayerManager] = useState(null);
  const [player, setPlayer] = useState(null);
  const [marketLoop, setMarketLoop] = useState(null);

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

    setLandmarks(landmarks);
    setClassifier(classifier);
    setMe(me);
    setPlayerManager(playerManager);
    setPlayer(player);
    setMarketLoop(marketLoop);

    classifier.load();
    marketLoop.init();
    marketLoop.run();
  }, []);

  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera
        landmarks={landmarks}
        classifier={classifier}
        setGestureData={setGestureData}
      />
      <GesturesPanel results={gestureData} gestureBuilder={classifier && classifier.gestureBuilder} />
      <MatchingEngineView me={me} player={player} gestureData={gestureData} />
    </div>
  );
}
