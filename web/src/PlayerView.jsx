export default function PlayerView(props) {
  if (!props.player || !props.marketLoop) return null;

  const price = props.marketLoop.getPrice();
  const mtm = Number(props.player.calcMTM(price)).toFixed(2);
  const orderHistories = props.player.orderHistories();
  const liveOrders = [].concat(
    props.player.getLiveBids(),
    props.player.getLiveOffers()
  );
  const tableWrapStyle = {
    width: "400px",
    textAlign: "left",
  };

  const tableStyle = {
    width: "100%",
    margin: "0 auto",
    textAlign: "left",
  };

  const tableHeaderStyle = {
    width: "75px",
  };

  return (
    <div style={tableWrapStyle}>
      <table style={tableStyle}>
        <caption>P&L and Position</caption>
        <tbody>
          <tr>
            <td>{props.player.name}</td>
          </tr>
          <tr>
            <td>{price}</td>
          </tr>
          <tr>
            <td>{mtm}</td>
          </tr>
          <tr>
            <td>{props.player.openPosition()}</td>
          </tr>
        </tbody>
      </table>

      {/* Live Orders */}
      <table style={tableStyle}>
        <caption>Working</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Qty&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Price</th>
          </tr>
        </thead>
        <tbody>
          {liveOrders.map((order) => {
            return (
              <tr>
                <td>{order.qty}</td>
                <td>{order.price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Order History */}
      <table style={tableStyle}>
        <caption>Order History</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Qty&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Price</th>
          </tr>
        </thead>
        <tbody>
          {orderHistories.map((orderRecord) => {
            return (
              <tr>
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
