import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useGameContext, GameState } from "../../components/GameContext";
import { Camera } from "../../camera";
import { Classifier, GestureBuilder } from "../../lib/gesture";
import GesturesPanel from "./gestures/GesturesPanel.jsx";
import MatchingEngineView from "./MatchingEngineView.jsx";
import PlayerStatus from "./player/PlayerStatus.jsx";
import useEventManager from "./useEventManager";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import InfoTabs from "./infopanel/InfoTabs.jsx";

/*
 * CameraGestures.jsx
 * Main "game loop" component driven by calcGesture().
 *
 * A gesture is extracted from each camera frame; serves as a typical game loop
 * which re-renders the prop classes passed to GesturePanel, PlayerStatus,
 * MatchingEngineView.
 *
 * Most child elements do require subtle re-renderings (price changes, message
 * triggers, gamestate, etc.)
 */
export default function CameraGesture(props) {
  /* default bootstrap size */
  const defaultCameraDims = { width: 636, height: 477 };
  const [gestureData, setGestureData] = useState(null);
  const [classifier] = useState(() => new Classifier());
  const [gestureBuilder] = useState(() => new GestureBuilder());
  const [gesture, setGesture] = useState(null);
  const { messagesDispatch } = useInfoPanel();
  const gameContext = useGameContext();

  const npcPlayerManager =
    props.marketLoop && props.marketLoop.npcPlayerManager;
  const numNPC = npcPlayerManager && npcPlayerManager.numPlayers;

  /*
   * INIT
   */
  useEffect(() => {
    console.log("[CameraGesture.jsx]: useEffect init");

    gestureBuilder.load().then(() => {
      classifier.load(gestureBuilder.garbage_idx);
    });
  }, [gestureBuilder, classifier]);

  /*
   * Event Generation
   * randomly generates event per gesture frame (low probability)
   */
  useEventManager({ gesture, eventManager: props.eventManager });

  /*
   * checkGameState every gesture frame; determine if player lost, levels up
   */

  useEffect(() => {
    const noChange = [
      GameState.QUIT,
      GameState.LOSE,
      GameState.LEVELUP,
    ].includes(gameContext.state);

    if (noChange) return;

    console.log(
      `[checkGameState]: ${gameContext.state}, npcPlayers: ${numNPC}`
    );

    const price = props.marketLoop && props.marketLoop.getPrice();

    if (props.player && props.player.hasLost(price)) {
      gameContext.setState(GameState.LOSE);
      return;
    }

    if (props.player && props.player.hasNextLevel(price)) {
      gameContext.setState(GameState.LEVELUP);
      return;
    }

    //triggers init -> run
    if (gameContext.state === GameState.INIT && gesture !== null) {
      gameContext.setState(GameState.RUN);
    }
  }, [gesture, gameContext, numNPC, props.marketLoop, props.player]);

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
      const hasHands = landmarks.handLandmarks.some((l) => l !== -1);

      //calculates gesture and if order is built
      props.gestureDecision.calc(gesture);

      //toggles for draw
      landmarks.setRecognizedGesture(gesture);

      //send any messages populated in calc this calcGesture() pass
      for (let msg of props.gestureDecision.getNewMessages()) {
        messagesDispatch(msg);
      }
      //NB: local gestureDecision msgQueue (not context)
      props.gestureDecision.resetMessages();

      setGestureData({ ...probsArgMax, gesture, hasHands });
      setGesture(gesture);
    },
    [classifier, gestureBuilder, props.gestureDecision, messagesDispatch]
  );

  //console.log("[CameraGesture] render", gestureData);
  const isReady = !props.cameraEnabled ||
        (gameContext.state !== GameState.INIT && gesture !== null);

  return (
    <>
      <div className="d-grid main-wrapper">
        <div className="camera text-center">
          <Camera
            isActive={props.cameraEnabled}
            isVisible={isReady}
            width={defaultCameraDims.width}
            height={defaultCameraDims.height}
            calcGesture={calcGesture}
          />
        </div>

        {!isReady && (
          <div className="d-flex flex-column justify-content-center vh-75">
            <Spinner
              animation="border"
              role="status"
              className="align-self-center"
            />
            <div className="mt-3 fs-2 align-self-center">Loading</div>
            <div className="align-self-center text-center vw-100">
              Designed for Desktop Browser
            </div>
            <div className="align-self-center text-center vw-100">
              Please ensure your camera is enabled (required)
            </div>
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

            <div className="gestures" data-testid="gestures">
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
