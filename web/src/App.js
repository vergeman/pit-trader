import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./Main.jsx";
import Home from "./Home.jsx";
import Navbar from "./Navbar.jsx";

function App() {
  return (
    <div className="App">
      <Navbar />
      {
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/demo" element={<Main />} />
        </Routes>
      }
    </div>
  );
}

export default App;
