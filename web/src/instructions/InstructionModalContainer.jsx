import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function InstructionModalContainer(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);

  return (
    <>
      <Button onClick={handleOpen}>Detailed Instructions</Button>
      <div className="modal show">
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{props.buttonLabel}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {props.children}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary">Close</Button>
            <Button variant="primary" onClick={() => handleClose()}>
              Restart
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
}
