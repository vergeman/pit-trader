import InstructionFigure from "./InstructionFigure.jsx";

export default function Prices(props) {
  return (
    <div>
      <h4>Prices</h4>
      <p>To indicate a price, extend the numeric hand signal from the body</p>
      <p>
        Note the palm orientation indicates a buyer (3 bid), and a seller (at
        5).
      </p>
      <div className="d-flex justify-content-evenly align-items-end">
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/price-buy-3.png`}
          caption="Pay 3"
          className="fit"
        />
        <InstructionFigure
          src={`${process.env.PUBLIC_URL}/instructions/price-sell-5.png`}
          caption="Offer 5"
          className="fit"
        />
      </div>
    </div>
  );
}
