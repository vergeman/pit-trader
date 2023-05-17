import InstructionFigure from "./InstructionFigure.jsx";
import InstructionModalContainer from "./InstructionModalContainer.jsx";
import Instructions from "./Instructions.jsx";

export default function LoadingInstructions(props) {
  return (
    <div className="bg-light text-dark rounded-sm p-3">
      <h4>Quick Reminder</h4>

      <div className="d-flex justify-content-evenly align-items-end">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => {
          return (
            <InstructionFigure
              key={`instruction-image-${i}`}
              src={`${process.env.PUBLIC_URL}/instructions/${num}.png`}
              width={num > 5 ? 80 : 50}
              caption={num}
            />
          );
        })}
      </div>
      <table className="table text-dark">
        <thead>
          <tr>
            <th>Action</th>
            <th>Orientation / Location</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Buy / Sell</td>
            <td>Palm in / Palm out</td>
          </tr>
          <tr>
            <td>Quantity 1-9</td>
            <td>Chin</td>
          </tr>
          <tr>
            <td>Quantity Multiples 10s</td>
            <td>Forehead</td>
          </tr>
          <tr>
            <td>Price</td>
            <td>Body</td>
          </tr>
        </tbody>
      </table>

      <div className="text-end">
        <InstructionModalContainer title="Detailed Instructions">
          <Instructions />
        </InstructionModalContainer>
      </div>
    </div>
  );
}
