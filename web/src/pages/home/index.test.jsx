import { BrowserRouter } from "react-router-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Home from "./index";

describe("Home page", () => {
  it("renders title", () => {
    const TITLE = "PIT TRADER";

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const element = screen.getAllByText(TITLE)[0];
    expect(element.tagName).toBe("H1");
    expect(element).toBeInTheDocument();
  });

  it("renders an input element with a 4-character placeholder", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const inputElement = screen.getByRole("textbox");
    expect(inputElement.getAttribute("name")).toBe("badge");
    expect(inputElement.getAttribute("placeholder")).toHaveLength(4);
  });

  it("has Instructions button, when clicked triggers instructions modal", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", { name: "INSTRUCTIONS" });
    const link = within(button).getByRole('link');

    const bodyElement = document.body;
    expect(bodyElement.getAttribute("class")).not.toBe("modal-open");
    expect(button.textContent).toBe("INSTRUCTIONS");

    fireEvent.click(link);

    expect(bodyElement.getAttribute("class")).toBe("modal-open");
  });

  it("has Enter button, when clicked visits /pit and applies badge as param", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const button = screen.getByRole("button", { name: "ENTER" });
    const inputElement = screen.getByRole("textbox");
    const badge = inputElement.getAttribute("placeholder");

    expect(button.textContent).toBe("ENTER");

    //Simulate a click event on the button
    fireEvent.click(button);

    //check url is /pit?badgeId=${badge}
    expect(window.location.pathname + window.location.search).toBe(
      `/pit?badge=${badge}`
    );
  });

});