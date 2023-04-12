import { Image, Figure } from "react-bootstrap";
import InstructionFigure from "./InstructionFigure.jsx";

export default function Numbers(props) {
  return (
    <div>
      <h4>Buying / Selling</h4>
      <p>
        <div>
          <strong>Buy</strong>: Form the numeric hand signs below with palms
          facing toward (in).
        </div>
        <div>
          <strong>Sell</strong>: Form the numeric hand signs below with palms
          away (out).
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

      <h4>Numbers</h4>
      <p>
        With palms facing in, the numbers below indicate a buyer. Whether the
        number relates to quantity or price depends if hand is near the face or
        body, respectively.
      </p>
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
      <p className="mt-2">
        Images provided by{" "}
        <a href="https://tradepractices.files.wordpress.com/2012/07/commodity-and-futures-handsignals.pdf">
          CME
        </a>
        .
      </p>
    </div>
  );
}
