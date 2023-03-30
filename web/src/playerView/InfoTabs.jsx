import { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import OrderTable from "./OrderTable.jsx";
import InfoPanel from "../infopanel/InfoPanel.jsx";

/*
 * NB: <Tab> subcomponents don't automatically render if extracted to own
 * component - keep all <Tab>'s here.
 */
export default function InfoTabs(props) {
  const defaultActiveKey = "messages";
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  if (!props.player) return null;

  const liveOrders = []
    .concat(props.player.getLiveBids(), props.player.getLiveOffers())
    .sort((a, b) => Number(a.timestamp < b.timestamp));

  const orderHistories = props.player
    .orderHistories()
    .sort((a, b) => Number(a.timestamp < b.timestamp));

  {/* NB: pass setActiveKey to programmatically change Tab
    * TODO: expand to reducer? pass into InfoPanel?
    */ }
  return (
    <Tabs
      onSelect={(k) => setActiveKey(k)}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      className="mb-3"
    >
      <Tab eventKey="messages" title="Messages">
        <InfoPanel init="test" setActiveKey={setActiveKey} />
      </Tab>
      <Tab eventKey="quests" title="Quests">
        Quests here
      </Tab>
      <Tab eventKey="live-orders" title="Live Orders">
        <OrderTable type="live" orders={liveOrders} />
      </Tab>
      <Tab eventKey="order-history" title="Order History">
        <OrderTable type="histories" orders={orderHistories} />
      </Tab>
    </Tabs>
  );
}
