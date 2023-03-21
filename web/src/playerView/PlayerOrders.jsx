import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import OrderTable from "./OrderTable.jsx";

export default function PlayerOrders(props) {
  if (!props.player) return null;

  const orderHistories = props.player
    .orderHistories()
    .sort((a, b) => Number(a.timestamp < b.timestamp));

  const liveOrders = []
    .concat(props.player.getLiveBids(), props.player.getLiveOffers())
    .sort((a, b) => Number(a.timestamp < b.timestamp));

  return (
    <Tabs
      defaultActiveKey="live-orders"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      {/* Live Orders */}
      <Tab eventKey="live-orders" title="Live Orders">
        <OrderTable type="live" orders={liveOrders} />
      </Tab>

      {/* Order History */}
      <Tab eventKey="order-history" title="Order History">
        <OrderTable type="histories" orders={orderHistories} />
      </Tab>
    </Tabs>
  );
}
