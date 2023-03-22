import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import PlayerManager from "./player/PlayerManager";
import Player from "./player/Player";
import MarketLoop from "./player/MarketLoop";

import LoseModal from "./LoseModal";
import useMarketLoopRunner from "./player/useMarketLoopRunner.jsx";

export default function Main(props) {
  const config = {
    tick: 1000,
    limitPL: -1000,
  };

  const [isLose, setIsLose] = useState(false);
  const [isLoop, setIsLoop] = useState(true);

  const [me, setMe] = useState(null);
  const [playerManager, setPlayerManager] = useState(null);
  const [player, setPlayer] = useState(null);
  const [marketLoop, setMarketLoop] = useState(null);

  useEffect(() => {
    const npcs = [
      new Player("npc-A"),
      new Player("npc-B"),
      new Player("npc-C"),
    ];
    const me = new MatchingEngine();
    const playerManager = new PlayerManager(me, npcs);
    const player = new Player("test", true, config);
    const marketLoop = new MarketLoop(playerManager, 100);

    setMe(me);
    setPlayerManager(playerManager);
    setPlayer(player);
    setMarketLoop(marketLoop);

    marketLoop.init();
  }, []);

  useMarketLoopRunner(marketLoop, isLoop, 1000);

  const resetGame = () => {

    console.log("reset");
    if (player) {
      //player.reset();
      player.orders = [];
      //me.reset()
      //past gestures reset
      //playerManager.resetAll()
      //marketLoop.reset()?
      setIsLose(false);
      setIsLoop(true);
    }
  };

  const triggerGameState = () => {
    console.log("[Main.jsx] triggerGameState");
    const price = marketLoop && marketLoop.getPrice();

    if (player && player.hasLost(price)) {
      setIsLose(true);
      setIsLoop(false);
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

      {/* TODO: make component */}
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
