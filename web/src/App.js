import logo from './logo.svg';
import './App.css';
import { Routes, Route, Link } from "react-router-dom";
import Demo from './Demo.jsx'

function App() {
  return (

    <div className="App">
      {
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      }
    </div>
  );
}

function Home() {
  return (
    <header className="App-header">
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
    </header>
  )
}


export default App;
