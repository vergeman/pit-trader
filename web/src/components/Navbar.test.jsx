import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "./Navbar.jsx";
import { GameContext, GameState } from "./GameContext.jsx";


describe("Navbar", () => {
  const removeHost = (e) => e.href.replace("http://localhost", "");

  //links on home page
  it("on home page (/) contains home (/) and instructions modal link", () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    const homeLinkElement = screen.getByText("PIT TRADER");
    const instructionsModalLinkElement = screen.getByText("Instructions");

    expect(removeHost(homeLinkElement)).toBe(`/`);
    expect(removeHost(instructionsModalLinkElement)).toBe(`/#`);
    expect(links.length).toBe(2);
  });

  //links on /pit
  it("on /pit page contains home (/), instructions modal link, leave modal", () => {
    render(
      <MemoryRouter initialEntries={['/pit?badge=abcd']}>
        <Navbar />
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    const homeLinkElement = screen.getByText("PIT TRADER");
    const instructionsModalLinkElement = screen.getByText("Instructions");
    const leaveModalLinkElement = screen.getByText("Leave");

    expect(removeHost(homeLinkElement)).toBe(`/`);
    expect(removeHost(instructionsModalLinkElement)).toBe(`/#`);
    expect(removeHost(leaveModalLinkElement)).toBe(`/#`);
    expect(links.length).toBe(3);
  });


  it("instructions modal link opens modal", () => {
    render(
      <MemoryRouter initialEntries={['/pit?badge=abcd']}>
        <Navbar />
      </MemoryRouter>
    );

    const bodyElement = document.body;
    expect(bodyElement.getAttribute("class")).not.toBe("modal-open");
    const instructionsModalLinkElement = screen.getByText("Instructions");
    fireEvent.click(instructionsModalLinkElement);
    expect(bodyElement.getAttribute("class")).toBe("modal-open");
  });


  it("leave modal link triggers modal", async () => {
    //NB: for 'Leave' there is no actual Modal component defined in Navbar
    //(unlike InstructionModalContainer) so modal isn't triggered, only the
    //click handler, leaveClickHandler, which calls gameContext.setState
    //
    //the easiest way to test this behavior is to mock the context provider's
    //setState method

    const setStateMock = jest.fn();

    render(
      <MemoryRouter initialEntries={['/pit?badge=abcd']}>
      <GameContext.Provider value={{setState: setStateMock}}>
          <Navbar />
        </GameContext.Provider>
      </MemoryRouter>
    );

    const leaveModalLinkElement = screen.getByText("Leave");
    fireEvent.click(leaveModalLinkElement);
    expect(setStateMock).toHaveBeenCalledWith(GameState.QUIT);
  });
});