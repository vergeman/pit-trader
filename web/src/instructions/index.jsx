import { Container, Col, Nav, Row, Tab } from "react-bootstrap";
import Numbers from "./Numbers.jsx";
import Prices from "./Prices.jsx";
import Quantities from "./Quantities.jsx";
import Examples from "./Examples.jsx";
import Actions from "./Actions.jsx";

export default function Instructions(props) {
  return (
    <Container className="instructions bg-light text-dark">
      <h1 className="offset-2 px-3-5 py-2">Instructions</h1>
      <Tab.Container defaultActiveKey="numbers">
        <Row>
          {/* Nav */}
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="numbers">Numbers</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="price">Prices</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="quantity">Quantities</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="example">Example</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="action">Actions</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          {/* Content */}
          <Col sm={10}>
            <Tab.Content>
              <Tab.Pane eventKey="numbers">
                <Numbers />
              </Tab.Pane>
              <Tab.Pane eventKey="price">
                <Prices />
              </Tab.Pane>
              <Tab.Pane eventKey="quantity">
                <Quantities />
              </Tab.Pane>
              <Tab.Pane eventKey="example">
                <Examples />
              </Tab.Pane>
              <Tab.Pane eventKey="action">
                <Actions />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
