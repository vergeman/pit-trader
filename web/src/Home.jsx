import logo from "./logo.svg";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { LoadingInstructions } from "./instructions";

export default function Home() {
  return (
    <div>
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Link to="/demo">demo</Link>
      </div>

      <div className="d-flex flex-column justify-center align-items-center">
        <LoadingInstructions />
      </div>
    </div>
  );
}
