import { BrowserRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders title link", () => {
  const TITLE = "PIT TRADER";

  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const linkElement = screen.getAllByText(TITLE)[0];
  expect(linkElement).toBeInTheDocument();
});
