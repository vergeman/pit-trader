import InstructionFigure from "./InstructionFigure.jsx";

export default function Quantities(props) {
  return (
    <div>
      <h4>Quantities</h4>
      <p>
        To indicate a quantity, place the numeric hand signal near the face.
      </p>
      <div>
        <strong>0-9</strong>: signal near chin.
      </div>
      <div>
        <strong>10, 20, 30...100</strong>: for multiples of 10, signal near
        forehead.{" "}
      </div>
      <p>
        Combinations of numbers use hand signals in sequence; to indicate the
        quantity <var>21</var>, signal <var>20</var> near the forehead, and then
        signal <var>1</var> near the chin.
      </p>
      <p>
        The examples below indicate <strong>buying</strong> quantities of 1, 7,
        10, respectively. A seller would make the same gestures, with the palm
        facing out (away).
      </p>
      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/qty-buy-1.png`}
          caption="Buy 1"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/qty-buy-7.png`}
          caption="Buy 7"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/qty-buy-10.png`}
          caption="Buy 10"
          className="fit"
        />
      </div>
    </div>
  );
}
