import { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Quests from "./Quests.jsx";
import OrderTable from "./OrderTable.jsx";
import Messages from "./Messages.jsx";
import { useInfoPanel } from "./InfoPanelContext";
import useTabNums from "./useTabNums.jsx";

/*
 * NB: <Tab> subcomponents don't automatically render if extracted to own
 * component - keep all <Tab>'s here.
 */

const TabMapKey = {
  MESSAGES: "messages",
  QUESTS: "quests",
  LIVEORDERS: "live-orders",
  ORDERHISTORY: "order-history",
};

export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const { activeTab, activeTabDispatch, messages, eventState } = useInfoPanel();

  const quests = []; //TODO: quests

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

  //we want to guarantee order as it's used as a useFffect dependency
  const tabMap = new Map([
    [TabMapKey.MESSAGES, { tabTitle: "Messages", values: messages }],
    [TabMapKey.QUESTS, { tabTitle: "Quests", values: quests }],
    [TabMapKey.LIVEORDERS, { tabTitle: "Live Orders", values: liveOrders }],
    [
      TabMapKey.ORDERHISTORY,
      { tabTitle: "Order History", values: orderHistories },
    ],
  ]);

  const { tabNums, resetTabNum } = useTabNums(activeTab, tabMap);

  const selectTabHandler = (eventKey) => {
    resetTabNum(eventKey);
    activeTabDispatch({ type: "select", value: eventKey });
  };

  const tabTitleNew = (key, tabMap, tabNums) => {
    const titleText = tabMap.get(key).tabTitle;
    const num =
      key === activeTab ? 0 : tabMap.get(key).values.length - tabNums[key];

    const styleNum = {
      color: "red",
      visibility: num ? "visible" : "hidden", //spacing can be distracting
    };

    return (
      <span>
        {titleText}
        {<span style={styleNum}> ({num})</span>}
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
      <Tab
        eventKey={TabMapKey.MESSAGES}
        title={tabTitleNew(TabMapKey.MESSAGES, tabMap, tabNums)}
      >
        <Messages messages={messages} />
      </Tab>
      <Tab
        eventKey={TabMapKey.QUESTS}
        title={tabTitleNew(TabMapKey.QUESTS, tabMap, tabNums)}
      >
        <Quests eventState={eventState}/>
      </Tab>
      <Tab
        eventKey={TabMapKey.LIVEORDERS}
        title={tabTitleNew(TabMapKey.LIVEORDERS, tabMap, tabNums)}
      >
        <OrderTable type="live" orders={liveOrders} />
      </Tab>
      <Tab
        eventKey={TabMapKey.ORDERHISTORY}
        title={tabTitleNew(TabMapKey.ORDERHISTORY, tabMap, tabNums)}
      >
        <OrderTable type="histories" orders={orderHistories} />
      </Tab>
    </Tabs>
  );
}
