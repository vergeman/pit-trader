import PlayerStatusHeaderElement from "./PlayerStatusHeaderElement.jsx";

export default function PlayerStatus(props) {
  if (!props.player || !props.marketLoop) return null;

  //openPosition: held position
  //price is "best" - pnl is based on this price
  //pnl: based on "best" price logic (midpoint, or last)
  //avgPrice: price on only executed trades
  //lastPrice: last traded
  const openPosition = props.player.openPosition();
  const price = Number(props.marketLoop.getPrice()).toFixed(1);
  const pnl = Number(props.player.calcPnL(price)).toFixed(2);
  const avgPrice = props.player.calcAvgPrice();
  const lastPrice = props.marketLoop.getLastPrice();
  //open, avgPrice -> pnl, price, last
  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between text-bg-dark p-1">
        <PlayerStatusHeaderElement label="Name" value={props.player.name} />
        <PlayerStatusHeaderElement label="Position" value={openPosition} />
        <PlayerStatusHeaderElement label="P&L" value={pnl} />
        <PlayerStatusHeaderElement label="Avg Price" value={avgPrice} />
        <PlayerStatusHeaderElement label="Last" value={lastPrice} />
      </div>
    </div>
  );
}
