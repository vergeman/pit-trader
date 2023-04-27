/* News / Alert/ Challenge / Message Component */
import Table from "react-bootstrap/Table";
import Message from "./Message";
export default function Messages(props) {
  return (
    <Table bordered size="sm" className="w-100">
      <thead>
        <tr>
          <th>Time</th>
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
              <td>
                {message.time &&
                  message.time.toLocaleTimeString([], {
                    hour12: false,
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    fractionalSecondDigits: 3,
                  })}
              </td>
              <td className="w-100">{message.text}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
