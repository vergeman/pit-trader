import InstructionFigure from "./InstructionFigure.jsx";

export default function LoadingInstructions(props) {
  return (
    <div className="bg-light text-dark rounded p-3">
      <h4>Quick Reminder</h4>

      <div className="d-flex justify-content-evenly align-items-end">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          return (
            <InstructionFigure
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

      <h5 className="text-end">
        Detailed Instructions?
      </h5>
    </div>
  );
}
