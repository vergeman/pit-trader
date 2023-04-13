import InstructionFigure from "./InstructionFigure.jsx";

export default function Examples(props) {
  return (
    <div>
      <h4>Example</h4>
      <p>
        To build an order, combine the <strong>Quantity</strong> and{" "}
        <strong>Price</strong> hand signals.
      </p>
      <p>
        The trader below will "pay 3 for 7".
      </p>

      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/price-buy-3.png`}
          caption="Price: 3"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/qty-buy-7.png`}
          caption="Quantity: 7"
          className="fit"
        />

      </div>
    </div>
  );
}
