/* News / Alert/ Challenge / Message Component */
import {useReducer} from "react";
import { Row, Col } from "react-bootstrap";

//(state, action)
function messagesReducer(messages, action) {

  switch (action.type) {
    case 'add':
      return [
        ...messages,
        {
          //id?
          text: action.text
        }
      ];

    default: {
      throw Error("action.type doesn't exist", action.type);
    }
  }

}

export default function MessagesContainer(props) {

  //const [messages, setMessages] = useState([]);
  const [messages, dispatch] = useReducer(messagesReducer, []);

  const addMessage = (text) => {
    //dispatch(action obj)
    dispatch({
      type: 'add',
      text: text,
    });
  }

  return (
    <Row>
      <Col>
        <div className="d-flex justify-content-center">
          <div onClick={() => addMessage(props.value) }>
            News Logger says
          </div>
          <p>
            {
              messages.map((message) => {
                return <div>{message.text}</div>;
              })
            }
          </p>
        </div>
      </Col>
    </Row >
  );
};