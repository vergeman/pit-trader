/* News / Alert/ Challenge / Message Component */
import { useMessages, useMessagesDispatch } from "./InfoPanelContext.jsx";
import { Row, Col } from "react-bootstrap";

export default function InfoPanelContainer(props) {
  const messages = useMessages();
  const dispatch = useMessagesDispatch();

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
