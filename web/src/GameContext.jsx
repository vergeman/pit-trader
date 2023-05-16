import { useState, createContext, useContext, useMemo } from "react";
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

export function useGameContext() {
  return useContext(GameContext);
}

export function GameContextProvider(props) {
  let query = useQuery();

  const [state, setState] = useState(GameState.INIT);
  const [gameID, setGameID] = useState((new Date()).getTime());
  const [isDebug, setIsDebug] = useState(query.get("debug"));

  return (
    <GameContext.Provider value={{ state, setState, gameID, setGameID, isDebug }}>
      {props.children}
    </GameContext.Provider>
  );
}

export default GameContext;
