import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import OrderTable from "./OrderTable.jsx";
import Messages from "./Messages.jsx";
import { useInfoPanel } from "./InfoPanelContext";
import useTabNums from "./useTabNums.jsx";

/*
 * NB: <Tab> subcomponents don't automatically render if extracted to own
 * component - keep all <Tab>'s here.
 */
export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const { activeTab, activeTabDispatch, messages } = useInfoPanel();

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

  //TODO: refactor to take eventKey mapping e.g {live-orders: liveOrders}
  //want single locale for keys and hook dependencies
  const { tabNums, resetTabNum } = useTabNums(
    activeTab,
    messages,
    quests,
    liveOrders,
    orderHistories
  );

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
      <Tab
        eventKey="messages"
        title={tabTitleNew("Messages", messages.length - tabNums["messages"])}
      >
        <Messages messages={messages} />
      </Tab>
      <Tab
        eventKey="quests"
        title={tabTitleNew("Quests", quests.length - tabNums["quests"])}
      >
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
