import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function InstructionModalContainer(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);

  return (
    <>
      {props.button && <Button onClick={handleOpen}>{props.title}</Button>}

      {!props.button && (
        <a className="nav-link" href="#" onClick={handleOpen}>
          {props.title}
        </a>
      )}

      <div className="modal show">
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title className="text-dark">{props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {props.children}

            <div className="mt-2 text-dark">
              Images provided by{" "}
              <a href="https://tradepractices.files.wordpress.com/2012/07/commodity-and-futures-handsignals.pdf">
                CME
              </a>
              .
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
