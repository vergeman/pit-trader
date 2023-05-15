import { useState, createContext, useContext } from "react";
export const GameContext = createContext(null);

export const GameState = {
  INIT: 1, //TODO: currently inactve, but for any loading screen
  RUN: 2,
  LOSE: 3,
  LEVELUP: 4,
  STOP: 5,
};

export function useGameContext() {
  return useContext(GameContext);
}

export function GameContextProvider(props) {
  const [state, setState] = useState(GameState.INIT);
  const [gameID, setGameID] = useState(0);

  //TODO: gameId
  return (
    <GameContext.Provider value={{ state, setState, gameID, setGameID }}>
      {props.children}
    </GameContext.Provider>
  );
}

export default GameContext;
