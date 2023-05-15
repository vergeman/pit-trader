import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import highscores from "./highscores.json";
import { useGameContext, GameState } from "./GameContext.jsx";

const NUM_HIGHSCORES = 15;

export default function LoseModal(props) {
  const [show, setShow] = useState(props.isLose);
  const gameContext = useGameContext();

  const reset = () => {
    props.resetGame();
    setShow(false);
  };

  useEffect(() => {
    setShow(props.isLose);
  }, [props.isLose]);

  console.log("[LoseModal] render", props.price, props.player);

  const current_id = `${gameContext.gameID}-${props.player.name}`;

  const player_highscores = Object.keys(window.localStorage)
    .filter((key) => key.startsWith("PT_HIGHSCORE"))
    .map((key) => JSON.parse(localStorage.getItem(key)));

  const players = [...player_highscores, ...highscores]
    .sort((a, b) => b.score - a.score)
    .splice(0, NUM_HIGHSCORES);

  return (
    <div className="modal show">
      <Modal show={show} onHide={reset}>
        <Modal.Header>
          <Modal.Title className="text-dark">Peak Scores</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex justify-content-center">
            <table className="table text-dark caption-top">
              <caption>
                P&L: {props.player.lostPnL && props.player.lostPnL.toFixed(2)} -
                You Blew Up! 🤯
              </caption>
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="losemodal-score">Highest $</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => {
                  const id = `${gameContext.gameID}-${p.name}`;
                  return (
                    <tr className={p.id === id ? "isLive" : ""}>
                      <td>{p.name}</td>
                      <td className="losemodal-score">
                        {p.score.toLocaleString()}
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
