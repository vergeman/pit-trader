import { useState, useEffect } from "react";

export default function useTabNums(
  activeTab,
  messages,
  quests,
  liveOrders,
  orderHistories
) {
  const initTabNums = {
    //eventKey: num
    "messages": messages.length,
    "quests": quests.length,
    "order-history": orderHistories.length,
    "live-orders": liveOrders.length,
  };

  const [tabNums, setTabNums] = useState(initTabNums);

  const resetTabNum = (eventKey) => {
    let num = 0;
    switch (eventKey) {
      case "messages":
        num = messages.length;
        break;
      case "quests":
        num = quests.length;
        break;
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
  }, [messages.length, quests.length, liveOrders.length, orderHistories.length]);

  return { tabNums, resetTabNum };
}
