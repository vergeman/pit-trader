import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { LoadingInstructions } from "./instructions";

export default function Home() {
  return (
    <div>
      <img
        id="home-background-image"
        src={`${process.env.PUBLIC_URL}/blog_07-tales-from-the-pits.jpg`}
        alt="background image pit trading"
      />
      <div className="App-header">
        <h1 id="home-hero-text">PIT TRADER</h1>

        <Link to="/demo">
          <Button id="home-hero-cta" className="mt-4" size="lg" variant="dark">
            Enter
          </Button>
        </Link>
      </div>
    </div>
  );
}
