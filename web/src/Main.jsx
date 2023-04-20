import { useEffect, useState, useCallback } from "react";
import { Container } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import MatchingEngine from "./engine/MatchingEngine";
import NPCPlayerManager from "./player/NPCPlayerManager";
import Player from "./player/Player";
import GestureDecision from "./gesture/GestureDecision";
import MarketLoop from "./player/MarketLoop";
import LoseModal from "./LoseModal";
import Message from "./infopanel/Message";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import { useGameContext, GameState } from "./GameContext.jsx";

export default function Main(props) {
  const config = {
    tick: 1000,
    limitPL: -1000,
  };

  const [me, setMe] = useState(new MatchingEngine());
  const [npcPlayerManager, setNPCPlayerManager] = useState(
    new NPCPlayerManager(me, [
      new Player("npc-A"),
      new Player("npc-B"),
      new Player("npc-C"),
      new Player("npc-D"),
    ])
  );
  const badge = new URLSearchParams(window.location.search).get("badge");
  const [player, setPlayer] = useState(
    new Player(badge || "Trader", true, config)
  );
  const [marketLoop, setMarketLoop] = useState(
    new MarketLoop({ npcPlayerManager, priceSeed: 100 })
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

  const { messagesDispatch } = useInfoPanel();
  const gameContext = useGameContext();

  //INIT
  useEffect(() => {
    marketLoop.init();
  }, []);

  //GAMESTATE
  useEffect(() => {
    switch (gameContext.state) {
      case GameState.INIT:
      //any pre stuff?
      case GameState.RUN:
        marketLoop.start();
        break;
      case GameState.LOSE:
      case GameState.STOP:
        marketLoop.stop();
        break;

      default:
    }

    return () => {
      console.log("[Main.jsx] cleanup");
      marketLoop.stop();
    };
  }, [gameContext.state]);

  const resetGame = () => {
    //fired on modal
    console.log("[Main] resetGame()");
    if (player) {
      messagesDispatch({ type: Message.Restart }); //clear infopanel messages
      gestureDecision.resetRecords();
      player.reset();
      npcPlayerManager.resetAll();
      me.reset();
      marketLoop.init();

      gameContext.setGameID(gameContext.gameID + 1);
      gameContext.setState(GameState.RUN);
    }
  };

  console.log("[Main.jsx] render:", gameContext.state);

  return (
    <Container id="main" className="pt-6">
      <LoseModal
        player={player}
        price={marketLoop && marketLoop.getPrice()}
        isLose={gameContext.state == GameState.LOSE}
        resetGame={resetGame}
      />

      {/* CameraGesture set to camera poll */}
      <CameraGesture
        me={me}
        player={player}
        marketLoop={marketLoop}
        gestureDecision={gestureDecision}
      />
    </Container>
  );
}
