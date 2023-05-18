import { useState, useEffect, useCallback } from "react";
import { useGameContext, GameState } from "../../../components";

export default function useTabNums(activeTab, tabMap) {

  const gameContext = useGameContext();

  //eventKey: last number
  //e.g. {"messages": 2, "liveOrders": 3....}
  const initTabNumLens = (tabMap) => {
    const initTabNums = {};
    Array.from(tabMap.entries()).forEach(([k, v]) => {
      initTabNums[k] = v.values.length;
    });
    return initTabNums;
  };

  //tabNums "catches up" with the current eventKey-lengths so unseen diff
  //becomes 0.
  const [tabNums, setTabNums] = useState(() => initTabNumLens(tabMap));

  const setTabNumsSeen = useCallback((eventKey) => {
    let num = 0;
    num = tabMap.get(eventKey).values.length;
    tabNums[eventKey] = num;
    setTabNums({ ...tabNums });
  }, [tabMap, tabNums]);

  // resets the tabNum on active tab so they are all "seen"
  useEffect(
    () => {
      if (gameContext.state === GameState.INIT) {
        initTabNumLens(tabMap);
      }

      setTabNumsSeen(activeTab);
    },
    //Array.from(tabMap.values()).map((v) => v.values.length)
    [activeTab, tabMap, setTabNumsSeen, gameContext.state]
  );

  return { tabNums, setTabNumsSeen };
}
