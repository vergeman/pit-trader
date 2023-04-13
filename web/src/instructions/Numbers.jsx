import { Image, Figure } from "react-bootstrap";
import InstructionFigure from "./InstructionFigure.jsx";

export default function Numbers(props) {
  return (
    <div>
      <h4>Numbers</h4>
      <p>Learn the hand signals below to indicate quantities or prices.</p>
      <div className="d-flex justify-content-evenly align-items-end">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          return (
            <InstructionFigure
              src={`${process.env.PUBLIC_URL}/instructions/${num}.png`}
              width={num > 5 ? 110 : 60}
              caption={num}
            />
          );
        })}
      </div>

      <h4>Buying / Selling</h4>
      <p>
        <div>
          <strong>Buy</strong>: Form the numeric hand sign above with palms
          facing in, or toward the body.
        </div>
        <div>
          <strong>Sell</strong>: Form the numeric hand sign above with palms
          turned out, or away from the body.
          <br />
        </div>
      </p>

      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/buy.png`}
          caption="Buy"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/sell.png`}
          caption="Sell"
          className="fit"
        />
      </div>
    </div>
  );
}
