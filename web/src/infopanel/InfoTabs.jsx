import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import GestureDecisionEvent from "./GestureDecisionEvent.jsx";
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
  GESTUREDECISIONEVENT: "gesture-decision-event",
  LIVEORDERS: "live-orders",
  ORDERHISTORY: "order-history",
};

export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const { activeTab, activeTabDispatch, messages, gestureDecisionEvent } =
    useInfoPanel();

  const challenges = [];

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
   * challenges: defined here, not used
   * liveOrders: filtered here
   * orderHistories: filtered here
   */

  const tabMap = new Map([
    [TabMapKey.MESSAGES, { tabTitle: "Messages", values: messages }],
    [
      TabMapKey.GESTUREDECISIONEVENT,
      { tabTitle: "Challenges", values: challenges },
    ],
    [TabMapKey.LIVEORDERS, { tabTitle: "Live Orders", values: liveOrders }],
    [
      TabMapKey.ORDERHISTORY,
      { tabTitle: "Order History", values: orderHistories },
    ],
  ]);

  //on selecting active tab, setTabs as seen by setting
  //tabNums count to equal the tabMap values' length
  const { tabNums, setTabNumsSeen } = useTabNums(activeTab, tabMap);

  const calcTabNum = (key, tabMap, tabNums) => {
    const num = tabMap.get(key).values.length - tabNums[key];
    if (num >= 0) return num;

    // negative values are possible:
    // .e.g working live orders are filled, so no longer live (liveOrders.length - 1)
    // even if filtering by dates, if order is no longer live, the order simply "disappears"
    // from the tab, as it no longer exists to be seen.
    //
    // Returning 0 covers up the temporary negative count until it reconciles by
    // being marked as seen.
    setTabNumsSeen(key);
    return 0;
  };

  const selectTabHandler = (eventKey) => {
    setTabNumsSeen(eventKey);
    activeTabDispatch({ type: "select", value: eventKey });
  };

  const tabTitleNew = (key, tabMap, tabNums) => {
    const titleText = tabMap.get(key).tabTitle;
    const num = key === activeTab ? 0 : calcTabNum(key, tabMap, tabNums);

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
        eventKey={TabMapKey.GESTUREDECISIONEVENT}
        title={tabTitleNew(TabMapKey.GESTUREDECISIONEVENT, tabMap, tabNums)}
      >
        <GestureDecisionEvent gestureDecisionEvent={gestureDecisionEvent} />
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
