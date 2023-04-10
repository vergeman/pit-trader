import { useState, createContext, useContext } from "react";
export const GameStateContext = createContext(null);

export function useGameStateContext() {
  return useContext(GameStateContext);
}

export function GameStateContextProvider(props) {
  const [isLose, setIsLose] = useState(false);
  //TODO: enums, gameId, isLoop
  return (
    <GameStateContext.Provider value={{ isLose, setIsLose }}>
      {props.children}
    </GameStateContext.Provider>
  );
}

export default GameStateContext;
