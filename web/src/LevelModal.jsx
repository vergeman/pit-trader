import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useGameContext, GameState } from "./GameContext.jsx";

export default function LevelModal(props) {
  const gameContext = useGameContext();
  const [show, setShow] = useState(props.show);

  const close = () => {
    gameContext.setState(GameState.RUN);
    setShow(false);
  };

  useEffect(() => {
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

  return (
    <div className="modal show">
      <Modal show={show} onHide={close}>
        <Modal.Header>
          <Modal.Title className="text-dark3">Level Modal</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex justify-content-center">
            <strong>Level {props.player.configLevel + 1} Modal</strong>
          </div>

          <div className="d-flex justify-content-center">
            <Button
              style={{ textAlign: "right" }}
              variant="primary"
              onClick={() => close()}
            >
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
