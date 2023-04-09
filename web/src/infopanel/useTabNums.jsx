import { useState, useEffect } from "react";

export default function useTabNums(activeTab, tabMap) {
  //eventKey: last number
  //e.g. {"messages": 2}
  const initTabNumLens = (tabMap) => {
    const initTabNums = {};
    Array.from(tabMap.entries()).map(([k, v]) => {
      initTabNums[k] = v.values.length;
    });
    return initTabNums;
  };

  const [tabNums, setTabNums] = useState(() => initTabNumLens(tabMap));

  const resetTabNum = (eventKey) => {
    let num = 0;
    num = tabMap.get(eventKey).values.length;
    tabNums[eventKey] = num;
    setTabNums({ ...tabNums });
  };

  // reset the tabNum on active tab so there is no 'new'
  useEffect(
    () => {
      resetTabNum(activeTab);
    },
    Array.from(tabMap.values()).map((v) => v.values.length)
  );

  return { tabNums, resetTabNum };
}
