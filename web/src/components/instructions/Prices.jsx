import InstructionFigure from "./InstructionFigure.jsx";

export default function Prices(props) {
  return (
    <div>
      <h4>Prices</h4>
      <p>Extend the numeric hand signal in front of the body to denote a price.</p>
      <p>
        The palm's orientation indicates a buyer or seller:
      </p>
      <ul>
        <li>Facing in: a buyer (Pay 3)</li>
        <li>Facing away: a seller (Offer 5).</li>
      </ul>
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
