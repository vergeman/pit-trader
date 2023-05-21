import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

jest.mock("./infopanel/InfoPanelContext", () => {
  return {
    useInfoPanel: () => {
      return {
        activeTab: "messages",
        messages: [],
        messagesDispatch: {},
        gestureDecisionEventDispatch: {},
        gestureDecisionEvent: {
          state_msg: {},
          expiry: jest.fn,
          gestureDecisionEventState: 0,
        },
      };
    },
  };
});

jest.mock("../../components/GameContext", () => {
  return {
    useGameContext: () => {
      const gameContext = {
        setState: (state) => {},
        badge: "abcd",
        state: 2,
      };
      return gameContext;
    },
    gameContext: {
      state: {},
    },
    GameState: {
      INIT: 1,
      RUN: 2,
      QUIT: 3,
      LOSE: 4,
      LEVELUP: 5,
      STOP: 6,
    },
  };
});

const mediaPipeStub = function () {
  return {
    onResults: () => {},
    setOptions: () => {},
  };
};

window.FaceDetection = mediaPipeStub;
window.Hands = mediaPipeStub;
window.SelfieSegmentation = mediaPipeStub;
window.Camera = function () {
  return {
    start: () => {},
    stop: () => {},
  };
};

import Main from "./index";

describe("Main page /pit", () => {
  it("starts marketLoop", () => {
    render(
      <MemoryRouter initialEntries={["/pit?badge=abcd"]}>
        <Main cameraEnabled={false} />
      </MemoryRouter>
    );

    //camera
    const screenElement = screen.getByTestId("video-canvas");
    expect(screenElement).toBeInTheDocument();

    //playerstatus
    [
      screen.getByText("Name"),
      screen.getByText("Position"),
      screen.getByText("P&L"),
      screen.getByText("Last", { selector: ".player-status-label" }),
    ].forEach((elem) => expect(elem).toBeInTheDocument());

    //matchingengineview
    [
      screen.getByText("Buy Qty"),
      screen.getByText("Bid Size"),
      screen.getAllByText("Price", { selector: "th" })[0],
      screen.getAllByText("Price", { selector: "th" })[1],
      screen.getByText("Offer Size"),
      screen.getByText("Sell Qty"),
    ].forEach((elem) => expect(elem).toBeInTheDocument());

    //GesturesPanel GesturesDecisionDisplay: no gestureData to start so doesn't
    //render component, but we have wrapper
    const e = screen.getByTestId("gestures");
    expect(e).toBeInTheDocument();

    //info tabs
    [
      screen.getByRole("tab", { name: "Messages" }),
      screen.getByRole("tab", { name: "Challenges" }),
      screen.getByRole("tab", { name: "Live Orders" }),
      screen.getByRole("tab", { name: "Order History" }),
    ].forEach((elem) => expect(elem).toBeInTheDocument());
  });
});
