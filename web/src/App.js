import "./custom.scss";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./Main.jsx";
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
            path="/pit"
            element={
              <GameContextProvider>
                <InfoPanelProvider>
                  <Main />
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
