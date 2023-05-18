import { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import GestureDecisionEvent from "./GestureDecisionEvent.jsx";
import OrderTable from "./OrderTable.jsx";
import Messages from "./Messages.jsx";
import { useInfoPanel } from "./InfoPanelContext";

/*
 * NB: <Tab> subcomponents don't automatically render if extracted to own
 * component - keep all <Tab>'s here.
 */

const TabMapKey = {
  MESSAGES: "messages",
  GESTUREDECISIONEVENT: "gesture-decision-event",
  LIVEORDERS: "live-orders",
  ORDERHISTORY: "order-history",
};

export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const { activeTab, activeTabDispatch, messages, gestureDecisionEvent } =
    useInfoPanel();

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

  /*
   * Tab Value sources
   *
   * messages: context
   * GDE/challenges: these aren't queued or "unseen"
   * liveOrders: filtered here
   * orderHistories: filtered here
   */

  //on selecting active tab, setTabs as seen by setting
  //tabNums count to equal the tabMap values' length
  const buildTabMap = (numMessages, numLiveOrders, numOrderHistories) => {
    return {
      [TabMapKey.MESSAGES]: { tabTitle: "Messages", length: numMessages },
      [TabMapKey.GESTUREDECISIONEVENT]: { tabTitle: "Challenges", length: 0 },
      [TabMapKey.LIVEORDERS]: {
        tabTitle: "Live Orders",
        length: numLiveOrders,
      },
      [TabMapKey.ORDERHISTORY]: {
        tabTitle: "Order History",
        length: numOrderHistories,
      },
    };
  };

  const [tabMap, setTabMap] = useState(() =>
    buildTabMap(messages.length, liveOrders.length, orderHistories.length)
  );
  const [tabMapSeen] = useState(() =>
    buildTabMap(messages.length, liveOrders.length, orderHistories.length)
  );

  const setTabSeen = (tab) => {
    tabMapSeen[tab].length = tabMap[tab].length;
  };

  //calcTabNumUnseen() takes diff from payload lengths and tabNums - a snapshot
  //of lengths when last visited/seen. The difference is the number unseen.
  //we don't want negative 'unseen' values
  const calcTabNumUnseen = (key, tabMap, tabMapSeen) => {
    const num = tabMap[key].length - tabMapSeen[key].length;
    return Math.max(0, num);
  };

  const selectTabHandler = (eventKey) => {
    setTabSeen(eventKey);
    activeTabDispatch({ type: "select", value: eventKey });
  };

  useEffect(() => {
    console.log("[InfoTabs] useEFfect");
    setTabMap(
      buildTabMap(messages.length, liveOrders.length, orderHistories.length)
    );
  }, [activeTab, messages.length, liveOrders.length, orderHistories.length]);

  /*
   * Tab: Title + Num Unseen
   */
  const renderTabTitleNew = (key, tabMap, tabMapSeen) => {
    const titleText = tabMap[key].tabTitle;
    const numUnseen =
      key === activeTab ? 0 : calcTabNumUnseen(key, tabMap, tabMapSeen);

    setTabSeen(activeTab);

    const styleNum = {
      color: "red",
      visibility: numUnseen ? "visible" : "hidden", //spacing can be distracting
    };

    return (
      <span>
        {titleText}
        {<span style={styleNum}> ({numUnseen})</span>}
      </span>
    );
  };

  if (!props.player) return null;
  console.log("[InfoTabs] render");

  return (
    <Tabs
      onSelect={(k) => selectTabHandler(k)}
      activeKey={activeTab}
      defaultActiveKey={defaultActiveKey}
    >
      <Tab
        eventKey={TabMapKey.MESSAGES}
        title={renderTabTitleNew(TabMapKey.MESSAGES, tabMap, tabMapSeen)}
      >
        <Messages messages={messages} />
      </Tab>
      <Tab
        eventKey={TabMapKey.GESTUREDECISIONEVENT}
        title={renderTabTitleNew(
          TabMapKey.GESTUREDECISIONEVENT,
          tabMap,
          tabMapSeen
        )}
      >
        <GestureDecisionEvent gestureDecisionEvent={gestureDecisionEvent} />
      </Tab>
      <Tab
        eventKey={TabMapKey.LIVEORDERS}
        title={renderTabTitleNew(TabMapKey.LIVEORDERS, tabMap, tabMapSeen)}
      >
        <OrderTable type="live" orders={liveOrders} />
      </Tab>
      <Tab
        eventKey={TabMapKey.ORDERHISTORY}
        title={renderTabTitleNew(TabMapKey.ORDERHISTORY, tabMap, tabMapSeen)}
      >
        <OrderTable type="histories" orders={orderHistories} />
      </Tab>
    </Tabs>
  );
}
