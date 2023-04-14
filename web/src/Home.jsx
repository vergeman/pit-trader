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

        <h1 class="display-1 fw-bold">
          Pit Trader
        </h1>

        <Link to="/demo">
          <Button size="lg" variant="dark">Enter</Button>
        </Link>
      </div>

      <div className="d-flex flex-column justify-center align-items-center">
        <LoadingInstructions />
      </div>
    </div>
  );
}
