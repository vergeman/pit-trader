import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

export default function PlayerOrders(props) {
  if (!props.player) return null;

  const orderHistories = props.player.orderHistories();
  const liveOrders = [].concat(
    props.player.getLiveBids(),
    props.player.getLiveOffers()
  );

  {/* TODO: refactor to shared Order table view component */}
  return (
    <Tabs
      defaultActiveKey="live-orders"
      id="uncontrolled-tab-example"
      className="mb-3"
    >
      {/* Live Orders */}
      <Tab eventKey="live-orders" title="Live Orders">
        <table className="table caption-top table-borderless w-100">
          <thead>
            <tr>
              <th>Qty&nbsp;&nbsp;</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {liveOrders.map((order) => {
              return (
                <tr key={`live-${order.id}`}>
                  <td>{order.qty}</td>
                  <td>{order.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tab>

      {/* Order History */}
      <Tab eventKey="order-history" title="Order History">
        <table className="table caption-top table-borderless w-100">
          <thead>
            <tr>
              <th>Qty&nbsp;&nbsp;</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {orderHistories.map((orderRecord) => {
              return (
                <tr key={`orderRecord-${orderRecord.id}`}>
                  <td>{orderRecord.qty}</td>
                  <td>{orderRecord.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Tab>
    </Tabs>
  );
}
