import InstructionFigure from "./InstructionFigure.jsx";

export default function Actions(props) {
  return (
    <div>
      <h4>Actions</h4>
      <p>There are a plethora of other hand signals, notably:</p>
      <p>
        <div>
          <strong>Cancel</strong>: Cancel an order, or clear a previous hand
          signal.
        </div>
        <div>
          <strong>Market</strong>: Execute the order at the current market price. The signal
          is a horiztonal swipe across and away from the body.
        </div>
      </p>
      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/cancel.png`}
          caption="Cancel"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/market.png`}
          caption="Market"
          className="fit"
        />
      </div>
    </div>
  );
}
