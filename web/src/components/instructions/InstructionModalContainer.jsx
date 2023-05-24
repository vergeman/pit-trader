import { useState } from "react";
import Modal from "react-bootstrap/Modal";

export default function InstructionModalContainer(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleOpen = (e) => {
    e.preventDefault();
    setShow(true);
  };

  return (
    <>
      <a className="nav-link" href="/#" onClick={handleOpen}>
        {props.title}
      </a>

      <div className="modal show">
        <Modal size="lg" show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title className="text-dark">{props.title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {props.children}

            <div className="mt-2 text-dark">
              <div>
                Detailed Instructions and images courtesy of the{" "}
                <a
                  href="/commodity-and-futures-handsignals.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  CME
                </a>
                .
              </div>
              <div>
                Challenge Avatars designed by{" "}
                <a
                  href="https://ttdevelopers.github.io/EverySingleAvatar.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Turntable.fm
                </a>
              </div>
              <div>
                Project Source Code at{" "}
                <a
                  href="https://www.github.com/vergeman/pit-trader"
                  target="_blank"
                  rel="noreferrer"
                >
                  Github
                </a>
              </div>

            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}
