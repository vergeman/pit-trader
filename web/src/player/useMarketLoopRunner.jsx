import { useState, useEffect } from "react";

//TODO: expand gameState
export default function useMarketLoopRunner(marketLoop, gameState, maxTurnDelay = 1000) {

  //const [runLoop, setRunLoop] = useState(null);

  useEffect(() => {
    console.log("[useMarketLoop] load");
    let _runLoop = null;

    //gameState == false (no loss) start loop
    if (marketLoop && !gameState) {
      const numPlayers = marketLoop.playerManager.numPlayers;
      _runLoop = setInterval(() => marketLoop.run(maxTurnDelay), numPlayers * maxTurnDelay);
      //setRunLoop(_runLoop);
      console.log("[useMarketLoop] runLoop", _runLoop);
    }

    //gameState == True (loss); end loop
    if (marketLoop && gameState) {
      console.log("[useMarketLoop] cleanup clearInterval", _runLoop, "state:", gameState);
      clearInterval(_runLoop);
    }

    return () => {
      console.log("[useMarketLoop] cleanup clearInterval", _runLoop);
      clearInterval(_runLoop);
    };
  }, [marketLoop, gameState]);

  //return runLoop;
}
