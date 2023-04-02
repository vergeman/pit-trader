/* News / Alert/ Challenge / Message Component */
import { useInfoPanel } from "./InfoPanelContext.jsx";

export default function Messages(props) {

  const { messages } = useInfoPanel();

  return (
    <div>
      {messages.map((message, i) => {
        return <div key={`message-${i}`}>{message.text}</div>;
      })}
    </div>
  );
}
