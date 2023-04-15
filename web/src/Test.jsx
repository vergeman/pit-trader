import { useCallback, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useGameContext, GameState } from "./GameContext.jsx";
import TestChild from "./TestChild.jsx";

export default function Test(props) {

  const gameContext = useGameContext();

  const testFn = () => {

    console.log("[testFn]", gameContext.state);
    //gameContext.setState(gameContext.state + 1);

    return gameContext.state;
  };

  console.log("[Test] Render");
  return (
    <Container id="main" className="pt-6">
      <div className="d-grid main-wrapper">
        <TestChild testFn={testFn} />
      </div>
    </Container>

  );
}