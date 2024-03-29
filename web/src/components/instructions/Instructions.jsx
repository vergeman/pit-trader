import { Container, Col, Nav, Row, Tab } from "react-bootstrap";
import Numbers from "./Numbers.jsx";
import Prices from "./Prices.jsx";
import Quantities from "./Quantities.jsx";
import Examples from "./Examples.jsx";
import Actions from "./Actions.jsx";

export default function Instructions(props) {
  return (
    <Container className="instructions bg-light text-dark">
      <Tab.Container defaultActiveKey="numbers">
        <Row>
          {/* Nav */}
          <Col sm={3}>
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
              <hr className="d-xs-block d-sm-none"/>
            </Nav>
          </Col>

          {/* Content */}
          <Col sm={9}>
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
