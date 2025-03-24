import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { Instructions, InstructionModalContainer } from "../../components/instructions";
import useGameContext from "../../components/GameContext";

export default function Home() {
  const gameContext = useGameContext();

  const defaultBadgeBuilder = () => {
    const badge = [];
    const iters = Math.ceil(Math.random()) + 3; //3 or 4
    for (let i = 0; i < iters; i++) {
      const charCode = Math.floor(Math.random() * 26 + 97); //0-25 + 97 (a)
      badge.push(String.fromCharCode(charCode).toUpperCase());
    }

    return badge.join("");
  };

  const changeBadgeInputHandler = (e) => {
    const val = e.target.value.toUpperCase();
    gameContext.setBadge(defaultBadge);
    setBadge(val);
  };

  //NB: defaultBadge is placeholder, but initial value is blank
  const [defaultBadge] = useState(defaultBadgeBuilder());
  const [badge, setBadge] = useState("");

  useEffect(() => {
    if (gameContext ) {
      gameContext.setBadge(defaultBadge);
    }
  }, [defaultBadge, gameContext]);

  return (
    <div>
      <img
        id="home-background-image"
        src={`${process.env.PUBLIC_URL}/blog_07-tales-from-the-pits.jpg`}
        alt="background pit trading"
      />
      <div className="App-header">
        <h1 id="home-hero-text">PIT TRADER</h1>

        <div className="demo-image-wrapper">
          <img
            id="demo-image"
            src={`${process.env.PUBLIC_URL}/demo.gif`}
            alt="demo"
          />
        </div>

        <div id="home-badge">
          <p className="fs-6 fw-light text-dark">Enter Name</p>
          <input
            name="badge"
            className="fw-light no-border w-100"
            placeholder={defaultBadge}
            value={badge}
            onChange={changeBadgeInputHandler}
          />
        </div>


        <Button id="home-instructions-cta" size="sm" variant="dark">
          <InstructionModalContainer title="INSTRUCTIONS">
            <Instructions />
          </InstructionModalContainer>
        </Button>

        <Link to={`/pit?badge=${badge || defaultBadge}`}>
          <Button id="home-hero-cta" size="lg" variant="dark">
            ENTER
          </Button>
        </Link>


        <div id="webcam-disclaimer">Requires Webcam </div>

      </div>
    </div>
  );
}