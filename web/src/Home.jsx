import logo from "./logo.svg";
import { Link } from "react-router-dom";
import Instructions from "./instructions";

export default function Home() {
  return (
    <div>
      <div className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <Link to="/demo">demo</Link>
      </div>


      <Instructions />
    </div>
  );
}
