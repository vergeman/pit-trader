/* News / Alert/ Challenge / Message Component */
import Table from "react-bootstrap/Table";
import { useInfoPanel } from "./InfoPanelContext.jsx";

export default function Messages(props) {
  const { messages } = useInfoPanel();

  return (
    <Table bordered size="sm" className="w-100">
      <thead>
        <tr>
          <th>Time</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((message, i) => {
          return (
            <tr key={`message-${i}`}>
              <td>{message.time && message.time.toLocaleTimeString([], {hour12: false,
                                                                        hour: 'numeric',
                                                                        minute: 'numeric',
                                                                        second: 'numeric',
                                                                        fractionalSecondDigits: 3})}</td>
              <td className="w-100">{message.text}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
