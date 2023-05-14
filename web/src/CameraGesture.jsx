import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Camera from "./input/Camera.jsx";
import GesturesPanel from "./GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import PlayerStatus from "./playerView/PlayerStatus.jsx";
import Classifier from "./gesture/Classifier.js";
import GestureBuilder from "./gesture/GestureBuilder.ts";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import InfoTabs from "./infopanel/InfoTabs.jsx";
import { useGameContext, GameState } from "./GameContext.jsx";
import { Message } from "./infopanel/Message";
import { EventType } from "./player/Event";
import LevelModal from "./LevelModal";

export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [gestureBuilder, setGestureBuilder] = useState(null);
  const [gesture, setGesture] = useState(null);
  const infoPanel = useInfoPanel();
  const gameContext = useGameContext();

  const npcPlayerManager =
    props.marketLoop && props.marketLoop.npcPlayerManager;
  const numNPC = npcPlayerManager && npcPlayerManager.numPlayers;

  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");
    const gestureBuilder = new GestureBuilder();
    const classifier = new Classifier();

    setGestureBuilder(gestureBuilder);
    setClassifier(classifier);

    gestureBuilder.load().then(() => {
      classifier.load(gestureBuilder.garbage_idx);
    });
  }, [props.me, props.player, props.marketLoop]);

  /*
   * checkGameState every frame; determine if player lost or not, toggle
   * accordingly
   */

  useEffect(() => {
    console.log(
      `[checkGameState]: ${gameContext.state}, npcPlayers: ${numNPC}`
    );

    const price = props.marketLoop && props.marketLoop.getPrice();

    //calcGesture time delay sometimes allow MTM to touch loss threshold but
    //bounce back up. This can trigger LoseModal on/off. Early terminate once a
    //loss is touched
    if (gameContext.state == GameState.LOSE) return;
    if (gameContext.state == GameState.LEVELUP) return;

    if (props.player && props.player.hasLost(price)) {
      props.marketLoop.stop();
      props.gestureDecision.enable = false;
      props.eventManager.killEvent();
      gameContext.setState(GameState.LOSE);
      console.log("You Lose", props.player.lostPnL);
    } else if (gesture !== null) {
      //init -> run
      gameContext.setState(GameState.RUN);

      //level up configs
      //see configs.json for details; level corresponds to array index.
      if (props.player && props.player.hasNextLevel(price)) {
        const levelPnL =
          props.player.configs[
            props.player.configLevel
          ].levelPnL.toLocaleString();

        props.player.incrementLevel();
        props.npcPlayerManager.incrementLevel();
        props.eventManager.incrementLevel();
        props.riskManager.incrementLevel();

        const positionLimit =
          props.player.configs[props.player.configLevel].positionLimit;

        const limitPnL =
          props.player.configs[
            props.player.configLevel
          ].limitPnL.toLocaleString();

        const msg = {
          type: Message.Notice,
          value: {
            msg: `Level ${
              props.player.configLevel + 1
            } achieved! P&L exceeds ${levelPnL}.
Position limit increased to ${positionLimit}. Max Loss P&L to ${limitPnL}.`,
          },
        };

        console.log("Level Up", props.player.configLevel, msg);
        gameContext.setState(GameState.LEVELUP);
        infoPanel.messagesDispatch(msg);
      }
    }
  }, [gesture]);

  /*
   * EventManager
   */

  useEffect(() => {
    if (gameContext.state == GameState.LOSE) {
      props.marketLoop.stop();
      return;
    }

    //no events while "paused" on levelup screen
    if (gameContext.state === GameState.LEVELUP) return;

    //console.log("[CameraGesture] EventManager");
    const event = props.eventManager.generate();

    //issue: we do need to poll so can't just return
    if (!event) return;

    //GestureDecisionEvent - aka challenge
    //one time init
    if (event && event.type == EventType.GESTUREDECISION) {
      console.log("[CameraGesture] EventManager EventType.GESTUREDECISION");

      event.dispatchHandler = (msg, tabName = null) => {
        infoPanel.gestureDecisionEventDispatch(msg);

        if (tabName) {
          infoPanel.activeTabDispatch({
            type: "select",
            value: tabName,
          });
        }
      };

      //initial active state
      console.log("[CameraGesture]", event);
      props.eventManager.executeEvent();
      const msg = {
        type: EventType.GESTUREDECISION,
        value: event,
      };

      infoPanel.activeTabDispatch({
        type: "select",
        value: "gesture-decision-event",
      });

      infoPanel.gestureDecisionEventDispatch(msg);
    }

    /*
     * News
     */

    if (event && event.type == EventType.NEWS) {
      props.eventManager.executeEvent();
      //news
      const msg = { type: Message.NewsEvent, value: event };
      infoPanel.messagesDispatch(msg);
    }
  }, [gesture]);

  /*
   * calcGesture (gesture poll)
   */

  //useCallback to cache rerender of Camera by calcGesture (due to setGesture)
  const calcGesture = useCallback(
    async (landmarks) => {
      //NB: useCallback ensures React.memo works (execute signature will regen on this
      //comonent render)
      if (!classifier) return null;

      const probsArgMax = await classifier.classify(landmarks);
      const probMax = probsArgMax.probs[probsArgMax.argMax];
      const gesture = gestureBuilder.build(probsArgMax.argMax, probMax);
      const hasHands = landmarks.handLandmarks.some((l) => l != -1);

      //calculates gesture and if order is built
      props.gestureDecision.calc(gesture);

      //toggles for draw
      landmarks.setRecognizedGesture(gesture);

      //send any messages populated in calc this calcGesture() pass
      for (let msg of props.gestureDecision.getNewMessages()) {
        infoPanel.messagesDispatch(msg);
      }
      //NB: local gestureDecision msgQueue (not context)
      props.gestureDecision.resetMessages();

      setGestureData({ ...probsArgMax, gesture, hasHands });
      setGesture(gesture);
    },
    [classifier, gestureBuilder]
  );

  //console.log("[CameraGesture] render", gestureData);
  const isReady = gameContext.state != GameState.INIT;

  //new level if GameState.LEVELUP and no event, or has event but of type News
  //then launching a modal is OK.
  //For EventType.GESTUREDECISION, wait until event ends before launching level modal
  const isNewLevel = (gameContext.state == GameState.LEVELUP) &&
        (!props.eventManager.hasEvent() ||
         (props.eventManager.hasEvent() && props.eventManager.event.type == EventType.NEWS));

  return (
    <>
      <LevelModal
        player={props.player}
        marketLoop={props.marketLoop}
        show={isNewLevel}
      />

      <div className="d-grid main-wrapper">
        <div className="camera text-center">
          <Camera
            isActive={true}
            isVisible={isReady}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            calcGesture={calcGesture}
          />
        </div>

        {/*TODO: more informative loading feedback for spinner*/}
        {!isReady && (
          <div className="d-flex flex-column justify-content-center vh-75">
            <Spinner
              animation="border"
              role="status"
              className="align-self-center"
            />
            <div className="mt-3 fs-2 align-self-center">Loading</div>
          </div>
        )}

        {isReady && (
          <>
            <div className="me">
              <PlayerStatus
                player={props.player}
                marketLoop={props.marketLoop}
                riskManager={props.riskManager}
              />
              <MatchingEngineView
                me={props.me}
                marketLoop={props.marketLoop}
                player={props.player}
              />
            </div>

            <div className="gestures">
              <GesturesPanel
                gestureData={gestureData}
                gesture={gesture}
                gestureBuilder={gestureBuilder}
                gestureDecision={props.gestureDecision}
              />
            </div>
          </>
        )}
      </div>

      {/* Tab displays needs to re-render at CameraGesture level */}
      {isReady && <InfoTabs player={props.player} />}
    </>
  );
}
