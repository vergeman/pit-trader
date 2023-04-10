import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import NPCPlayerManager from "./player/NPCPlayerManager";
import Player from "./player/Player";
import GestureDecision from "./gesture/GestureDecision";
import MarketLoop from "./player/MarketLoop";
import LoseModal from "./LoseModal";
import useMarketLoopRunner from "./player/useMarketLoopRunner.jsx";
import { InfoPanelProvider } from "./infopanel/InfoPanelContext";

export default function Main(props) {
  const config = {
    tick: 1000,
    limitPL: -1000,
  };

  const [isLose, setIsLose] = useState(false);
  const [isLoop, setIsLoop] = useState(true);
  const [gameID, setGameID] = useState(0);

  const [me, setMe] = useState(new MatchingEngine());
  const [npcPlayerManager, setNPCPlayerManager] = useState(
    new NPCPlayerManager(me, [
      new Player("npc-A"),
      new Player("npc-B"),
      new Player("npc-C"),
    ])
  );
  const [player, setPlayer] = useState(new Player("test", true, config));
  const [marketLoop, setMarketLoop] = useState(
    new MarketLoop(npcPlayerManager, 100)
  );
  const [gestureDecision, setGestureDecision] = useState(
    new GestureDecision(
      me,
      marketLoop,
      player,
      750, //gesture Timeout
      1000 //gestureDecision view timeout
    )
  );

  useEffect(() => {
    marketLoop.init();
  }, []);

  useMarketLoopRunner(marketLoop, isLoop, 1000);

  const resetGame = () => {
    //fired on modal
    console.log("[Main] resetGame()");
    if (player) {
      gestureDecision.resetRecords();
      player.reset();
      npcPlayerManager.resetAll();
      me.reset();
      marketLoop.init();

      setGameID(gameID + 1); //resets context provider
      setIsLose(false);
      setIsLoop(true);
    }
  };

  const triggerGameState = () => {
    //console.log("[Main.jsx] triggerGameState");
    const price = marketLoop && marketLoop.getPrice();

    if (player && player.hasLost(price)) {
      setIsLose(true);
      setIsLoop(false);
    }
  };

  console.log("[Main.jsx] render", gameID);

  return (
    <Container id="main" className="pt-6">
      <LoseModal isLose={isLose} resetGame={resetGame} />
      <InfoPanelProvider gameID={gameID}>
        {/* CameraGesture set to camera poll */}
        <CameraGesture
          me={me}
          player={player}
          marketLoop={marketLoop}
          gestureDecision={gestureDecision}
          triggerGameState={triggerGameState}
        />
      </InfoPanelProvider>
    </Container>
  );
}
