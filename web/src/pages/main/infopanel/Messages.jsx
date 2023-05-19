/* News / Alert/ Challenge / Message Component */
import { useState } from "react";
import Table from "react-bootstrap/Table";
import Message from "./Message";

export default function Messages(props) {
  const [endTimeRender, setEndTimeRender] = useState(false);

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
          if (
            message.type === Message.NewsEvent &&
            message.endTime > Date.now()
          ) {
            colorClass = "text-warning";

            //InfoTabs is memoized, need to internally trigger this component to
            //re-render when 'active' Message event (NewsEvent) expires to reset
            //colorClass indicator.
            setTimeout(
              () => setEndTimeRender(!endTimeRender),
              message.endTime - Date.now() + 1
            );
          }

          //position limits error
          if (message.type === Message.ErrorSubmitOrder) {
            colorClass = "text-danger";
          }

          //level up
          if (message.type === Message.Notice) {
            colorClass = "text-success";
          }

          return (
            <tr className={colorClass} key={`message-${i}`}>
              <td className="td-time">
                {message.time && message.time.toLocaleTimeString()}
              </td>
              <td className="w-100">{message.text}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
