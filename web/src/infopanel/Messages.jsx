/* News / Alert/ Challenge / Message Component */
import { useInfoPanel } from "./InfoPanelContext.jsx";
import { Row, Col } from "react-bootstrap";

export default function Messages(props) {

  const { messages } = useInfoPanel();

  return (
    <Row>
      <Col>
        <div className="d-flex justify-content-center">
          <div>News Logger says</div>
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
