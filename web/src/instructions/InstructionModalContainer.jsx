import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function InstructionModalContainer(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);

  return (
    <>
      <Button onClick={handleOpen}>{props.title}</Button>
      <div className="modal show">
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title className="text-dark">{props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {props.children}

            <p className="mt-2 text-dark">
              Images provided by{" "}
              <a href="https://tradepractices.files.wordpress.com/2012/07/commodity-and-futures-handsignals.pdf">
                CME
              </a>
              .
            </p>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
