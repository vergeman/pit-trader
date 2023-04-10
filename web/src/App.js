import "./custom.scss";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./Main.jsx";
import Home from "./Home.jsx";
import Navbar from "./Navbar.jsx";
import { GameStateContextProvider } from "./GameStateContext.jsx";

function App() {
  return (
    <div className="App">
      <Navbar />
      {
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route
            path="/demo"
            element={
              <GameStateContextProvider>
                <Main />
              </GameStateContextProvider>
            }
          />
        </Routes>
      }
    </div>
  );
}

export default App;
