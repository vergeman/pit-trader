export default function PlayerView(props) {
  if (!props.player || !props.marketLoop) return null;

  const price = Number(props.marketLoop.getPrice()).toFixed(1);
  const mtm = Number(props.player.calcMTM(price)).toFixed(2);

  return (
    <div>
      <table className="table caption-top table-borderless w-100">
        <caption>P&L and Position</caption>
        <tbody>
          <tr>
            <td>
              Name: <strong>{props.player.name}</strong>
            </td>
          </tr>
          <tr>
            <td>
              Price: <strong>{price}</strong>
            </td>
          </tr>
          <tr>
            <td>
              MTM: <strong>{mtm}</strong>
            </td>
          </tr>
          <tr>
            <td>
              Position: <strong>{props.player.openPosition()}</strong>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}
