import { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { LoadingInstructions } from "./instructions";

export default function Home() {
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
    setBadge(val);
  };

  const [defaultBadge, setDefaultBadge] = useState(defaultBadgeBuilder());
  const [badge, setBadge] = useState(null);

  return (
    <div>
      <img
        id="home-background-image"
        src={`${process.env.PUBLIC_URL}/blog_07-tales-from-the-pits.jpg`}
        alt="background image pit trading"
      />
      <div className="App-header">
        <h1 id="home-hero-text">PIT TRADER</h1>

        <input
          name="badge"
          placeholder={defaultBadge}
          value={badge}
          onChange={changeBadgeInputHandler}
        />

        <Link to={`/demo?badge=${badge || defaultBadge}`}>
          <Button id="home-hero-cta" className="mt-4" size="lg" variant="dark">
            Enter
          </Button>
        </Link>
      </div>
    </div>
  );
}
