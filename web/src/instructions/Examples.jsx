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
        This trader indicates he wants to "Buy 7 for 3" - a quantity of 7
        contracts paying a price of 3.
      </p>

      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/qty-buy-7.png`}
          caption="Buy 7"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/price-buy-3.png`}
          caption="For 3"
          className="fit"
        />
      </div>
    </div>
  );
}
