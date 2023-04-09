import { useState, useEffect } from "react";

export default function useTabNums(activeTab, liveOrders, orderHistories) {
  const initTabNums = {
    //eventKey: num
    "order-history": orderHistories.length,
    "live-orders": liveOrders.length,
  };

  const [tabNums, setTabNums] = useState(initTabNums);

  const resetTabNum = (eventKey) => {
    let num = 0;
    switch (eventKey) {
      case "order-history":
        num = orderHistories.length;
        break;
      case "live-orders":
        num = liveOrders.length;
        break;
    }
    tabNums[eventKey] = num;
    setTabNums({ ...tabNums });
  };

  // reset the tabNum on active tab so there is no 'new'
  useEffect(() => {
    resetTabNum(activeTab);
  }, [liveOrders.length, orderHistories.length]);

  return { tabNums, resetTabNum };
}
