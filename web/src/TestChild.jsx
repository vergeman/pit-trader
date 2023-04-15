import { useCallback, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useGameContext, GameState } from "./GameContext.jsx";

export default function TestChild(props) {

  const gameContext = useGameContext();


  const calcChild = useCallback(() => {

    console.log("[calcChild]", gameContext.state);
    props.testFn();

    gameContext.setState(gameContext.state + 1);
  }, [gameContext.state]);

  console.log("[TestChild] Render");
  return (
    <div>
      <button onClick={() => props.testFn()}>TestFn Parent</button>
      <button onClick={() => calcChild()}>calcChild</button>

      <div>
        {gameContext.state}
      </div>
    </div>
  );
}