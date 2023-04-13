import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Instructions, InstructionModalContainer } from "./instructions";

export default function NavbarComponent() {
  const inheritStyle = { color: "inherit", textDecoration: "inherit" };

  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand>
          {/* TODO: adjust logo */}
          <img
            src="https://react-bootstrap.github.io/logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
          <Link to="/" style={inheritStyle}>
            Pit Trader
          </Link>
        </Navbar.Brand>

        {/* Links */}
        <Nav className="me-auto w-100">
          <Nav.Link as={Link} to="/">
            Home
          </Nav.Link>

          <Nav.Link as={Link} to="/demo">
            Demo
          </Nav.Link>
        </Nav>

        <InstructionModalContainer title="Instructions">
          <Instructions />
        </InstructionModalContainer>
      </Container>
    </Navbar>
  );
}
