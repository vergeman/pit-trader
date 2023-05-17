import { useEffect, useState, useCallback } from "react";
import { Container } from "react-bootstrap";
import CameraGesture from "./CameraGesture.jsx";

import { MarketLoop, MatchingEngine, RiskManager } from "./lib/exchange";
import { Player, NPCPlayerManager } from "./lib/player";
import { GestureDecision } from "./lib/gesture";
import {LoseQuitModal, LevelModal} from "./components/modal";
import Message from "./infopanel/Message";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import { useGameContext, GameState } from "./components/GameContext.jsx";
import { EventManager, EventType, GestureDecisionEvent } from "./lib/event";

import configs from "./Configs.ts";

export default function Main(props) {
  const gameContext = useGameContext();
  const { messagesDispatch, gestureDecisionEventDispatch } = useInfoPanel();

  const [riskManager, setRiskManager] = useState(
    () => new RiskManager(configs)
  );
  const [me, setMe] = useState(() => new MatchingEngine());
  const [npcPlayerManager, setNPCPlayerManager] = useState(
    () =>
      new NPCPlayerManager(me, [
        new Player("npc-A", false, configs),
        new Player("npc-B", false, configs),
        new Player("npc-C", false, configs),
        new Player("npc-D", false, configs),
      ])
  );

  const [player, setPlayer] = useState(
    () => new Player(gameContext.badge, true, configs)
  );
  const [marketLoop, setMarketLoop] = useState(
    () => new MarketLoop({ npcPlayerManager, priceSeed: 100 })
  );
  const [gestureDecision, setGestureDecision] = useState(
    () =>
      new GestureDecision(
        me,
        marketLoop,
        player,
        riskManager,
        750, //gesture Timeout
        1000, //gestureDecision view timeout,
        gameContext.isDebug
      )
  );
  const [eventManager, setEventManager] = useState(
    () => new EventManager(marketLoop, gestureDecision, configs)
  );

  //INIT
  useEffect(() => {
    marketLoop.init();

    //for debug mode, attach instances to window for console access
    if (gameContext.isDebug) {
      Object.assign(window, {
        pitTrader: {
          marketLoop,
          riskManager,
          npcPlayerManager,
          player,
          gestureDecision,
        },
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
      case GameState.QUIT:
      case GameState.LOSE:
        gestureDecision.enable = false;
        eventManager.killEvent();
        marketLoop.stop();
        break;
      case GameState.LEVELUP:
        levelUp();
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

      const gameID = new Date().getTime();
      gameContext.setGameID(gameID);
      gameContext.setState(GameState.INIT);
    }
  };

  //level up
  //see configs.json for details; level corresponds to array index.
  const levelUp = () => {
    const levelPnL = player.getConfig().levelPnL.toLocaleString();

    player.incrementLevel();
    npcPlayerManager.incrementLevel();
    eventManager.incrementLevel();
    riskManager.incrementLevel();

    const positionLimit = player.getConfig().positionLimit;

    const limitPnL = player.getConfig().limitPnL.toLocaleString();

    const msg = {
      type: Message.Notice,
      value: {
        msg: `Level ${player.configLevel + 1} achieved! P&L exceeds ${levelPnL}.
Position limit increased to ${positionLimit}. Max Loss P&L to ${limitPnL}.`,
      },
    };

    console.log("Level Up", player.configLevel, msg);
    messagesDispatch(msg);
  };

  console.log("[Main.jsx] render:", gameContext.state);

  return (
    <Container id="main" className="pt-6">
      <LoseQuitModal
        player={player}
        price={marketLoop && marketLoop.getPrice()}
        resetGame={resetGame}
      />

      <LevelModal
        player={player}
        marketLoop={marketLoop}
        eventManager={eventManager}
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
