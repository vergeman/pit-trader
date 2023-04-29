import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";

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
  const [badge, setBadge] = useState("");

  return (
    <div>
      <img
        id="home-background-image"
        src={`${process.env.PUBLIC_URL}/blog_07-tales-from-the-pits.jpg`}
        alt="background image pit trading"
      />
      <div className="App-header">
        <h1 id="home-hero-text">PIT TRADER</h1>

        <div id="home-badge">
          <p className="fs-6 fw-light text-dark">Enter Badge ID</p>
          <input
            name="badge"
            className="fw-light no-border w-100"
            placeholder={defaultBadge}
            value={badge}
            onChange={changeBadgeInputHandler}
          />
        </div>

        <Link to={`/pit?badge=${badge || defaultBadge}`}>
          <Button id="home-hero-cta" size="lg" variant="dark">
            Enter
          </Button>
        </Link>
      </div>
    </div>
  );
}
