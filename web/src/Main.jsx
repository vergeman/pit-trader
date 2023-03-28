import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import NPCPlayerManager from "./player/NPCPlayerManager";
import Player from "./player/Player";
import MarketLoop from "./player/MarketLoop";

import LoseModal from "./LoseModal";
import useMarketLoopRunner from "./player/useMarketLoopRunner.jsx";
import MessagesContainer from "./messages/MessagesContainer.jsx";

export default function Main(props) {
  const config = {
    tick: 1000,
    limitPL: -1000,
  };

  const [isLose, setIsLose] = useState(false);
  const [isLoop, setIsLoop] = useState(true);

  const [me, setMe] = useState(null);
  const [npcPlayerManager, setNPCPlayerManager] = useState(null);
  const [player, setPlayer] = useState(null);
  const [marketLoop, setMarketLoop] = useState(null);

  const [gestureDecision, setGestureDecision] = useState(null);

  useEffect(() => {
    const npcs = [
      new Player("npc-A"),
      new Player("npc-B"),
      new Player("npc-C"),
    ];
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, npcs);
    const player = new Player("test", true, config);
    const marketLoop = new MarketLoop(npcPlayerManager, 100);

    setMe(me);
    setNPCPlayerManager(npcPlayerManager);
    setPlayer(player);
    setMarketLoop(marketLoop);

    marketLoop.init();
  }, []);

  useMarketLoopRunner(marketLoop, isLoop, 1000);

  const resetGame = () => {
    console.log("reset");
    if (player) {
      gestureDecision.resetRecords();
      player.reset();
      npcPlayerManager.resetAll();
      me.reset();
      marketLoop.init();

      setIsLose(false);
      setIsLoop(true);
    }
  };


  const triggerGameState = (gestureDecision) => {
    //console.log("[Main.jsx] triggerGameState");
    const price = marketLoop && marketLoop.getPrice();

    if (player && player.hasLost(price)) {
      setIsLose(true);
      setIsLoop(false);
      setGestureDecision(gestureDecision);
    }
  };


  console.log("[Main.jsx] render");
  return (
    <Container className="pt-6" style={{ background: "azure" }}>

      <LoseModal isLose={isLose} resetGame={resetGame} />

      <CameraGesture
        me={me}
        player={player}
        marketLoop={marketLoop}
        triggerGameState={triggerGameState}
      />

      <MessagesContainer value="hi" />
    </Container>
  );
}
