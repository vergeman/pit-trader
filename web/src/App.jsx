import "./styles/custom.scss";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Main from "./pages/main/index.jsx";
import Home from "./pages/home/index.jsx";
import { Navbar } from "./components";
import { GameContextProvider } from "./components/GameContext.jsx";
import InfoPanelProvider from "./pages/main/infopanel/InfoPanelContext.jsx";

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
                  <Main cameraEnabled={true} />
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
