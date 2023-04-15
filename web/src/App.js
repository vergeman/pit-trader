import "./custom.scss";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./Main.jsx";
import Test from "./Test.jsx";
import Home from "./Home.jsx";
import Navbar from "./Navbar.jsx";
import { GameContextProvider } from "./GameContext.jsx";
import InfoPanelProvider from "./infopanel/InfoPanelContext.jsx";

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
              <GameContextProvider>
                <InfoPanelProvider>
                  <Test />
                </InfoPanelProvider>
              </GameContextProvider>

            }
          />
        </Routes>
      }
    </div>
  );
}

export default App;
