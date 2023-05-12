import { useEffect, useState, useCallback } from "react";
import { Container } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";
import RiskManager from "./player/RiskManager";
import MatchingEngine from "./engine/MatchingEngine";
import NPCPlayerManager from "./player/NPCPlayerManager";
import Player from "./player/Player";
import GestureDecision from "./gesture/GestureDecision";
import MarketLoop from "./player/MarketLoop";
import LoseModal from "./LoseModal";
import Message from "./infopanel/Message";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import { useGlobalContext } from "./GlobalContext.jsx";
import { useGameContext, GameState } from "./GameContext.jsx";
import { EventManager } from "./player/EventManager.ts";
import { EventType } from "./player/Event.ts";
import { GestureDecisionEvent } from "./player/GestureDecisionEvent";

import configs from "./Configs.ts";

export default function Main(props) {
  const { isDebug } = useGlobalContext();
  const gameContext = useGameContext();
  const { messagesDispatch, gestureDecisionEventDispatch } = useInfoPanel();

  const [riskManager, setRiskManager] = useState(new RiskManager(configs));
  const [me, setMe] = useState(new MatchingEngine());
  const [npcPlayerManager, setNPCPlayerManager] = useState(
    new NPCPlayerManager(me, [
      new Player("npc-A", false, configs),
      new Player("npc-B", false, configs),
      new Player("npc-C", false, configs),
      new Player("npc-D", false, configs),
    ])
  );
  const badge = new URLSearchParams(window.location.search).get("badge");
  const [player, setPlayer] = useState(
    new Player(badge || "Trader", true, configs)
  );
  const [marketLoop, setMarketLoop] = useState(
    new MarketLoop({ npcPlayerManager, priceSeed: 100 })
  );
  const [gestureDecision, setGestureDecision] = useState(
    new GestureDecision(
      me,
      marketLoop,
      player,
      riskManager,
      750, //gesture Timeout
      1000, //gestureDecision view timeout,
      isDebug
    )
  );
  const [eventManager, setEventManager] = useState(
    new EventManager(marketLoop, gestureDecision, configs)
  );

  //INIT
  useEffect(() => {
    marketLoop.init();

    //for debug mode, attach instances to window for console access
    if (isDebug) {
      Object.assign(window, {
        marketLoop,
        riskManager,
        npcPlayerManager,
        player,
        gestureDecision,
      });
    }
  }, []);

  //GAMESTATE
  useEffect(() => {
    switch (gameContext.state) {
      case GameState.INIT:
        //any pre stuff?
        gameContext.setState(GameState.RUN);
        break;
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

      gestureDecisionEventDispatch({
        type: EventType.GESTUREDECISION,
        value: new GestureDecisionEvent({}),
      });

      gestureDecision.resetRecords();
      player.reset();
      npcPlayerManager.resetAll();
      me.reset();
      eventManager.reset();
      marketLoop.stop();
      riskManager.reset();
      marketLoop.init();

      gameContext.setGameID(gameContext.gameID + 1);
      gameContext.setState(GameState.INIT);
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
        npcPlayerManager={npcPlayerManager}
        marketLoop={marketLoop}
        eventManager={eventManager}
        riskManager={riskManager}
        gestureDecision={gestureDecision}
      />
    </Container>
  );
}
