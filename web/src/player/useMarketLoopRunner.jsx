import { useState, useEffect } from "react";

export default function useMarketLoopRunner(marketLoop, maxTurnDelay = 1000) {

  const [runLoop, setRunLoop] = useState(null);

  useEffect(() => {
    console.log("[useMarketLoop] load");
    let _runLoop = null;

    if (marketLoop) {
      const numPlayers = marketLoop.playerManager.numPlayers;
      _runLoop = setInterval(() => marketLoop.run(maxTurnDelay), numPlayers * maxTurnDelay);
      setRunLoop(_runLoop);
      console.log("[useMarketLoop] runLoop", _runLoop);
    }

    return () => {
      console.log("[useMarketLoop] cleanup clearInterval", _runLoop);
      clearInterval(_runLoop);
    };
  }, [marketLoop]);

  return runLoop;
}
