import { useState, useEffect } from "react";

export default function useMarketLoopRunner(marketLoop, isActive, maxTurnDelay = 1000) {

  useEffect(() => {
    console.log("[useMarketLoop] load");
    let _runLoop = null;

    if (marketLoop && isActive) {
      const numPlayers = marketLoop.npcPlayerManager.numPlayers;
      _runLoop = setInterval(() => marketLoop.run(maxTurnDelay), numPlayers * maxTurnDelay);
      console.log("[useMarketLoop] runLoop", _runLoop);
    }

    if (marketLoop && !isActive) {
      console.log("[useMarketLoop] cleanup clearInterval", _runLoop, "state:", isActive);
      clearInterval(_runLoop);
    }

    //cleanup
    return () => {
      console.log("[useMarketLoop] cleanup clearInterval", _runLoop);
      clearInterval(_runLoop);
    };
  }, [marketLoop, isActive]);

}
