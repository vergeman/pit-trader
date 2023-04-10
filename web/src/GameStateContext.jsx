import { useState, createContext, useContext } from "react";
export const GameStateContext = createContext(null);

export const GameState = {
  INIT: 1, //TODO: currently inactve, but for any loading screen
  RUN: 2,
  LOSE: 3,
  STOP: 4,
};

export function useGameStateContext() {
  return useContext(GameStateContext);
}

export function GameStateContextProvider(props) {
  const [state, setState] = useState(GameState.RUN);

  //TODO: gameId
  return (
    <GameStateContext.Provider value={{ state, setState }}>
      {props.children}
    </GameStateContext.Provider>
  );
}

export default GameStateContext;
