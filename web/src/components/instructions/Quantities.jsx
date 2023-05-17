import InstructionFigure from "./InstructionFigure.jsx";

export default function Quantities(props) {
  return (
    <div>
      <h4>Quantities</h4>
      <p>Place the numeric hand signal around the face.</p>
      <ul>
        <li>
          <strong>0-9</strong>: Indicate single digits at the chin.
        </li>
        <li>
          <strong>10, 20, 30 . . . 100</strong>: For multiples of 10, form the
          gesture at the forehead.
        </li>
      </ul>
      <p>
        Combine hand signals in sequence; to indicate a quantity <var>21</var>,
        signal <var>20</var> at the forehead, and then a <var>1</var> near the
        chin.
      </p>
      <p>
        The examples below indicate buying quantities of 1, 7, 10, respectively.
        A seller would make the same gestures, with the palm facing out (away).
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
