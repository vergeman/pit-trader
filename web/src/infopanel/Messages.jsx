/* News / Alert/ Challenge / Message Component */
import Table from "react-bootstrap/Table";
import Message from "./Message";
export default function Messages(props) {
  return (
    <Table bordered size="sm" className="w-100">
      <thead>
        <tr>
          <th className="td-time">Time</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {props.messages.map((message, i) => {

          // highlight while event is active
          let colorClass = "";
          if (message.type == Message.NewsEvent &&
            message.endTime > Date.now()) {
            colorClass = "text-warning";
          }

          //position limits error
          if (message.type == Message.ErrorSubmitOrder) {
            colorClass = "text-danger";
          }

          return (
            <tr className={colorClass} key={`message-${i}`}>
              <td className="td-time">
                {message.time &&
                  message.time.toLocaleTimeString()}
              </td>
              <td className="w-100">{message.text}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
