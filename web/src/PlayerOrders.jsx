export default function PlayerOrders(props) {
  if (!props.player) return null;

  const orderHistories = props.player.orderHistories();
  const liveOrders = [].concat(
    props.player.getLiveBids(),
    props.player.getLiveOffers()
  );

  return (
    <div>

      {/* Live Orders */}
      <table className="table caption-top table-borderless w-100">
        <caption>Working</caption>
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

      {/* Order History */}
      <table className="table caption-top table-borderless w-100">
        <caption>Order History</caption>
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
    </div>
  );

}