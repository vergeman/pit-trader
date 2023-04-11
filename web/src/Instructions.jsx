import { Container, Col, Nav, Row, Tab } from "react-bootstrap";

function TabMainContent(props) {
  return `Hello ${props.test}`;
}

export default function Instructions(props) {
  return (
    <Container className="bg-light text-dark">
      <h1 className="text-center">Instructions</h1>
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
            </Nav>
          </Col>

          {/* Content */}
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="numbers">
                <TabMainContent />
              </Tab.Pane>
              <Tab.Pane eventKey="price">
                <TabMainContent />
              </Tab.Pane>
              <Tab.Pane eventKey="quantity">
                <TabMainContent />
              </Tab.Pane>
              <Tab.Pane eventKey="example">
                <TabMainContent />
              </Tab.Pane>
              <Tab.Pane eventKey="action">
                <TabMainContent />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}
