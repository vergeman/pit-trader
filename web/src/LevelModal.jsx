import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useGameContext, GameState } from "./GameContext.jsx";

export default function LevelModal(props) {
  const gameContext = useGameContext();
  const [show, setShow] = useState(props.show);

  const preloadImage = (level) => {
    //fetch image so browser has image cached before display
    const config = props.player.configs[level];
    if (!config) return;

    const img = new Image();
    img.src = config.reward.image;
  };

  const close = () => {
    preloadImage(props.player.configLevel + 1);
    gameContext.setState(GameState.RUN);
    setShow(false);
  };

  useEffect(() => {
    preloadImage(props.player.configLevel);
    setShow(props.show);
  }, [props.show]);

  //console.log("[LevelModal] render", props.player);

  //if modal is active we want to stop marketLoop regardless.
  //
  //Example: event activates just as new level is simultaneously touched. Modal
  //will wait until event is over - which triggers GameState.RUN and
  //marketloop.run(). Then modal launches, so marketLoop needs stop.
  //
  //Anytime modal is open marketLoop should be stopped

  if (show) {
    props.marketLoop.stop();
  }

  //on modal launch, level value will have already increased
  const level = props.player.configLevel;
  const reward = props.player.configs[level].reward;

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
              onload=""
              style={{ width: "100%", height: "100%" }}
              src={reward.image}
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
