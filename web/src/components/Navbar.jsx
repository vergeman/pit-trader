import { Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Instructions, InstructionModalContainer } from "./instructions";
import { useGameContext, GameState } from "./GameContext.jsx";
import { useLocation } from "react-router-dom";

export default function NavbarComponent() {
  const gameContext = useGameContext();
  const location = useLocation();
  const currentPath = location.pathname;

  const inheritStyle = { color: "inherit", textDecoration: "inherit" };

  const leaveClickHandler = (e) => {
    e.preventDefault();
    gameContext.setState(GameState.QUIT);
  };

  return (
    <Navbar bg="dark" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand>
          <Link id="nav-home-logo" style={inheritStyle} to="/">
            PIT TRADER
          </Link>
        </Navbar.Brand>

        {/* Links */}
        <Nav className="me-auto w-100">
          <InstructionModalContainer title="Instructions">
            <Instructions />
          </InstructionModalContainer>

          {currentPath === "/pit" && (
            <a
              className="nav-link"
              href="/#"
              onClick={leaveClickHandler}
            >
              Leave
            </a>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
