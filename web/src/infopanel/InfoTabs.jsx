import { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import OrderTable from "./OrderTable.jsx";
import Messages from "./Messages.jsx";
import { useInfoPanel } from "./InfoPanelContext";
/*
 * NB: <Tab> subcomponents don't automatically render if extracted to own
 * component - keep all <Tab>'s here.
 */
export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const { activeTab, activeTabDispatch } = useInfoPanel();

  const liveOrders = props.player
    ? []
        .concat(props.player.getLiveBids(), props.player.getLiveOffers())
        .sort((a, b) => Number(a.timestamp < b.timestamp))
    : [];

  const orderHistories = props.player
    ? props.player
        .orderHistories()
        .sort((a, b) => Number(a.timestamp < b.timestamp))
    : [];

  const initTabNums = {
    //eventKey: num
    "order-history": orderHistories.length,
    "live-orders": liveOrders.length,
  };

  const [tabNums, setTabNums] = useState(initTabNums);

  //reset the tabNum to active tab so there is no 'new'
  useEffect(() => {
    resetTabNum(activeTab);
  }, [liveOrders.length, orderHistories.length]);

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

  const selectTabHandler = (eventKey) => {
    resetTabNum(eventKey);
    activeTabDispatch({ type: "select", value: eventKey });
  };

  const tabTitleNew = (titleText, num) => {
    return (
      <span>
        {titleText}
        {!!num && <span style={{ color: "red" }}> ({num})</span>}
      </span>
    );
  };

  {
    /* NB: pass setActiveKey to programmatically change Tab
     * TODO: expand to reducer? pass into InfoPanel?
     */
  }

  if (!props.player) return null;

  return (
    <Tabs
      onSelect={(k) => selectTabHandler(k)}
      activeKey={activeTab}
      defaultActiveKey={defaultActiveKey}
    >
      <Tab eventKey="messages" title="Messages">
        <Messages />
      </Tab>
      <Tab eventKey="quests" title="Quests">
        Quests here
      </Tab>
      <Tab
        eventKey="live-orders"
        title={tabTitleNew(
          "Live Orders",
          liveOrders.length - tabNums["live-orders"]
        )}
      >
        <OrderTable type="live" orders={liveOrders} />
      </Tab>
      <Tab
        eventKey="order-history"
        title={tabTitleNew(
          "Order History",
          orderHistories.length - tabNums["order-history"]
        )}
      >
        <OrderTable type="histories" orders={orderHistories} />
      </Tab>
    </Tabs>
  );
}
