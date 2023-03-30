/* News / Alert/ Challenge / Message Component */
import { useInfoPanel } from "./InfoPanelContext.jsx";
import { Row, Col } from "react-bootstrap";

export default function Messages(props) {
  const infoPanel = useInfoPanel();
  const messages = infoPanel.messages;
  const dispatch = infoPanel.messagesDispatch;

  //TODO: remove test
  const addMessage = (text) => {
    dispatch({
      type: "add",
      text: text,
    });
  };

  return (
    <Row>
      <Col>
        <div className="d-flex justify-content-center">
          <div onClick={() => addMessage("click")}>News Logger says</div>
          <div>
            {messages.map((message, i) => {
              return <div key={`message-${i}`}>{message.text}</div>;
            })}
          </div>
        </div>
      </Col>
    </Row>
  );
}
