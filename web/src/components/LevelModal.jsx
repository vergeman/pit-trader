import { useState, useEffect, useCallback } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useGameContext, GameState } from "./GameContext.jsx";
import { EventType } from "../lib/event";

export default function LevelModal(props) {
  const gameContext = useGameContext();
  const [show, setShow] = useState(false);

  const preloadImage = useCallback((level) => {
    //fetch image so browser has image cached before display
    const config = props.player.getConfig(level);
    if (!config) return;

    const img = new Image();
    img.src = config.reward.image;
  },[props.player]);

  const close = () => {
    preloadImage(props.player.configLevel + 1);
    gameContext.setState(GameState.RUN);
    setShow(false);
  };

  //new level if GameState.LEVELUP and no event, or has event but of type News
  //then launching a modal is OK.
  //
  //For EventType.GESTUREDECISION, wait until event ends before launching level modal
  const isNewLevel =
    gameContext.state === GameState.LEVELUP &&
    (!props.eventManager.hasEvent() ||
      (props.eventManager.hasEvent() &&
        props.eventManager.event.type === EventType.NEWS));

  useEffect(() => {
    preloadImage(props.player.configLevel);
    setShow(isNewLevel);
  }, [isNewLevel, props.player.configLevel, preloadImage]);

  //Anytime modal is open marketLoop should be stopped
  if (show) {
    props.marketLoop.stop();
  }

  /*
   * Render
   */

  //on modal launch, level value will have already increased
  const level = props.player.configLevel;
  const reward = props.player.getConfig(level).reward;

  return (
    <div className="modal show">
      <Modal show={show} onHide={close}>
        <Modal.Header>
          <Modal.Title className="text-dark w-100 text-center">
            {/* sync with message; index vs level */}
            Level {level + 1} Achieved
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          <div className="d-flex justify-content-center">
            <img
              style={{ width: "100%", height: "100%" }}
              src={reward.image}
              alt={reward.text}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <div className="mb-3 text-dark w-100 text-center">{reward.text}</div>

          <div className="d-flex justify-content-center w-100">
            <Button
              style={{ textAlign: "center" }}
              variant="primary"
              onClick={() => close()}
            >
              Continue
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
