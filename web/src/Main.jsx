import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import PlayerManager from "./player/PlayerManager";
import Player from "./player/Player";
import MarketLoop from "./player/MarketLoop";

import LoseModal from "./LoseModal";
import useMarketLoopRunner from "./player/useMarketLoopRunner.jsx";
import usePlayerLoseState from "./player/usePlayerLoseState.jsx";

export default function Main(props) {
  const config = {
    tick: 1000,
    limitPL: -1000,
  };

  const [isLose, setIsLose] = useState(false);
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

  const reset = () => {
    //player.reset();
    console.log("reset");
    if (player) {
      player.orders = [];
      //TODO: need to remove gesture history, orderHistories, etc.
    }
  };

  //TODO: decide this hook usePlayerLoseState - move hook to <CamerGesture>
  //and then trigger setState change - pass accessor?
  //const isLose = usePlayerLoseState(player, marketLoop && marketLoop.getPrice());
  const checkGameState = () => {
    console.log("[Main.jsx] checkGameState");
    const price = marketLoop && marketLoop.getPrice();
    console.log(price, player);
    if (player && player.hasLost(price)) {
      setIsLose(true);
    }
  };

  //TODO: set to isActive  - separate from win loss, but decided by win loss state
  useMarketLoopRunner(marketLoop, isLose, 1000);

  console.log("[Main.jsx] isLose", isLose);
  return (
    <Container className="pt-6" style={{ background: "azure" }}>
      <LoseModal isLose={isLose} reset={reset} />

      <CameraGesture
        me={me}
        player={player}
        marketLoop={marketLoop}
        checkGameState={checkGameState}
        isLose={isLose}
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
