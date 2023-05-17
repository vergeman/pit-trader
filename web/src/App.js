import "./styles/custom.scss";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./Main.jsx";
import Home from "./Home.jsx";
import Navbar from "./components/Navbar.jsx";
import { GameContextProvider } from "./components/GameContext.jsx";
import InfoPanelProvider from "./infopanel/InfoPanelContext.jsx";

function App() {
  return (
    <div className="App">
      <GameContextProvider>
        <Navbar />
        {
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route
              path="/pit"
              element={

                <InfoPanelProvider>
                  <Main />
                </InfoPanelProvider>


              }
            />
          </Routes>
        }
      </GameContextProvider>
    </div>
  );
}

export default App;
