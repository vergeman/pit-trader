import { useState, createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";

export const GameContext = createContext(null);

export const GameState = {
  INIT: 1, //TODO: currently inactve, but for any loading screen
  RUN: 2,
  QUIT: 3,
  LOSE: 4,
  LEVELUP: 5,
  STOP: 6,
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function buildBadgeGameID(gameID, badge) {
  return [gameID, badge].join(" ");
}

export function useGameContext() {
  return useContext(GameContext);
}

export function GameContextProvider(props) {
  let query = useQuery();

  const [isDebug, setIsDebug] = useState(query.get("debug"));
  const [state, setState] = useState(GameState.INIT);
  const [gameID, setGameID] = useState(new Date().getTime());
  const [badge, setBadge] = useState(query.get("badge") || "Trader");
  const [badgeGameID, setBadgeGameID] = useState(
    buildBadgeGameID(gameID, badge)
  );

  //Main.jsx on resetGame, cascade the gameID change to badgeGameID
  useEffect(() => {
    setBadgeGameID(buildBadgeGameID(gameID, badge));
  }, [gameID]);

  return (
    <GameContext.Provider
      value={{
        state,
        setState,
        gameID,
        setGameID,
        isDebug,
        badge,
        setBadge,
        badgeGameID,
        setBadgeGameID,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
}

export default useGameContext;
