import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Instructions, InstructionModalContainer } from "./instructions";

export default function NavbarComponent() {
  const inheritStyle = { color: "inherit", textDecoration: "inherit" };
  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand>

          <Link id="nav-home-logo" style={inheritStyle} to="/" >
            PIT TRADER
          </Link>
        </Navbar.Brand>

        {/* Links */}
        <Nav className="me-auto w-100">
          <InstructionModalContainer title="Instructions">
            <Instructions />
          </InstructionModalContainer>
        </Nav>
      </Container>
    </Navbar>
  );
}
