import Table from "react-bootstrap/Table";
import { OrderType, OrderStatus } from "../engine/Order";
export default function OrderTable(props) {
  if (!props.orders) return null;

  return (
    <Table borderless="true" size="sm" className="w-100">
      <thead>
        <tr>
          <th>Time</th>
          <th>Status</th>
          <th>Type</th>
          <th>Qty&nbsp;&nbsp;</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {props.orders.map((order) => {
          const timeStamp = new Date(order.timestamp).toLocaleTimeString();
          return (
            <tr key={`${props.type}-${order.id}`}>
              <td>{timeStamp}</td>
              <td>{OrderStatus[order.status]}</td>
              <td>{OrderType[order.orderType]}</td>
              <td>{order.qty}</td>
              <td>{order.price}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
