import { useState, useEffect } from "react";
import { useGameContext, GameState } from "../../../components";

export default function useTabNums(activeTab, tabMap) {

  const gameContext = useGameContext();

  //eventKey: last number
  //e.g. {"messages": 2}
  const initTabNumLens = (tabMap) => {
    const initTabNums = {};
    Array.from(tabMap.entries()).forEach(([k, v]) => {
      initTabNums[k] = v.values.length;
    });
    return initTabNums;
  };

  const [tabNums, setTabNums] = useState(() => initTabNumLens(tabMap));

  const setTabNumsSeen = (eventKey) => {
    let num = 0;
    num = tabMap.get(eventKey).values.length;
    tabNums[eventKey] = num;
    setTabNums({ ...tabNums });
  };

  const resetAll = (tabMap) => {
    initTabNumLens(tabMap);
  };

  // resets the tabNum on active tab so there is no 'new'
  useEffect(
    () => {
      if (gameContext.state === GameState.INIT) {
        resetAll(tabMap);
      }

      setTabNumsSeen(activeTab);
    },
    Array.from(tabMap.values()).map((v) => v.values.length)
  );

  return { tabNums, setTabNumsSeen };
}
