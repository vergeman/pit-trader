import PlayerStatusHeaderElement from "./PlayerStatusHeaderElement.jsx";

export default function PlayerStatus(props) {
  if (!props.player || !props.marketLoop || !props.riskManager) return null;

  //openPosition: held position
  //price is "best" - pnl is based on this price
  //pnl: based on "best" price logic (midpoint, or last)
  //avgPrice: price on only executed trades
  //lastPrice: last traded
  const openPosition = props.player.openPosition();
  const price = props.marketLoop.getPrice();
  const pnl = Number(
    props.player.lostPnL || props.player.calcPnL(price)
  ).toFixed(2);
  const avgPrice = props.player.calcDisplayAvgPrice();
  const lastPrice = props.marketLoop.getDisplayLastPrice();

  //calc warning indicator
  const positions = props.riskManager._calcPositions(props.player);
  const limitClass =
    positions.open >= props.riskManager.warnPositionLimit ? "text-danger" : "";

  //open, avgPrice -> pnl, price, last
  return (
    <div className="player-status mb-md-2">
      <div className="d-flex flex-wrap justify-content-around p-1">
        <PlayerStatusHeaderElement
          label="Name"
          value={props.player.name}
          className="d-none d-md-flex"
        />
        <PlayerStatusHeaderElement
          labelClassName={limitClass}
          valueClassName={limitClass}
          label="Position"
          value={openPosition}
        />
        <PlayerStatusHeaderElement label="P&L" value={pnl} />
        <PlayerStatusHeaderElement label="Avg Price" value={avgPrice} />
        <PlayerStatusHeaderElement
          label="Last"
          value={lastPrice && lastPrice.toFixed(1)}
          className="d-none d-md-flex"
        />
      </div>
    </div>
  );
}
