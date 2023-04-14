import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function LoseModal(props) {
  const [show, setShow] = useState(props.isLose);
  const handleClose = () => setShow(false);

  const reset = () => {
    props.resetGame();
    setShow(false);
  };

  useEffect(() => {
    setShow(props.isLose);
  }, [props.isLose]);

  console.log("[LoseModal] render", props.price, props.player);

  const players = [
    {
      name: props.player.name,
      score: Math.round(props.player.maxPnL),
      isLive: true,
    },
    { name: "James Simons", score: 79846 },
    { name: "Ray Dalio", score: 72611 },
    { name: "Steven Cohen", score: 61188 },
    { name: "Kenneth Griffin", score: 47651 },
    { name: "George Soros", score: 41875 },
    { name: "Paul Tudor Jones II", score: 26971 },
    { name: "Michael Burry", score: 12532 },
    { name: "John Paulson", score: 1364 },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="modal show">
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-dark">Peak Scores</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex justify-content-center">
            <table className="table text-dark caption-top">
              <caption>You Blew Up! 🤯</caption>
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="losemodal-score">Highest $</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  return (
                    <tr className={p.isLive ? "isLive" : ""}>
                      <td>{p.name}</td>
                      <td className="losemodal-score">
                        {(p.score).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center">
            <Button
              style={{ textAlign: "right" }}
              variant="primary"
              onClick={() => reset()}
            >
              Restart
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
