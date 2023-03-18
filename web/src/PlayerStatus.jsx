import PlayerStatusHeaderElement from "./PlayerStatusHeaderElement.jsx";

export default function PlayerStatus(props) {
  if (!props.player || !props.marketLoop) return null;

  //TODO : calc proper last and avgPrice values
  const price = Number(props.marketLoop.getPrice()).toFixed(1);
  const mtm = Number(props.player.calcMTM(price)).toFixed(2);
  const avgPrice = Number(props.marketLoop.getPrice()).toFixed(1);
  const last = avgPrice;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between text-bg-dark p-1">
        <PlayerStatusHeaderElement label="Name" value={props.player.name} />
        <PlayerStatusHeaderElement
          label="Position"
          value={props.player.openPosition()}
        />
        <PlayerStatusHeaderElement label="Last" value={last} />
        <PlayerStatusHeaderElement label="Avg Price" value={avgPrice} />
        <PlayerStatusHeaderElement label="P&L" value={mtm} />
      </div>
    </div>
  );
}
