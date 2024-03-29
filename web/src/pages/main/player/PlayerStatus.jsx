import { useEffect } from "react";
import PlayerStatusHeaderElement from "./PlayerStatusHeaderElement.jsx";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import PlayerLevelIcons from "./PlayerLevelIcons";
import { useGameContext } from "../../../components/GameContext";

export default function PlayerStatus(props) {
  const gameContext = useGameContext();

  //localStorage highscore update
  useEffect(() => {
    console.log("[PlayerStatus] useEffect");
    const player_highscore = {
      id: gameContext.badgeGameID,
      name: props.player.name,
      score: Math.round(props.player.maxPnL),
      isLive: true,
    };

    localStorage.setItem(`PT_HIGHSCORE_${player_highscore.id}`, JSON.stringify(player_highscore));
  }, [props.player.maxPnL, props.player.name, gameContext.badgeGameID]);

  /*
   * Render
   */

  if (!props.player || !props.marketLoop || !props.riskManager) return null;

  //openPosition: held position
  //price is "best" - pnl is based on this price
  //pnl: based on "best" price logic (midpoint, or last)
  //avgPrice: price on only executed trades
  //lastPrice: last traded
  const warnLossPnLFactor = 0.75;
  const openPosition = props.player.openPosition();
  const price = props.marketLoop.getPrice();
  const pnl = Number(props.player.lostPnL || props.player.calcPnL(price));
  const displayPnL = pnl.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const lastPrice = props.marketLoop.getDisplayLastPrice();

  //calc warning indicator
  const positions = props.riskManager._calcPositions(props.player);
  const limitClass =
    Math.abs(positions.open) >= props.riskManager.warnPositionLimit()
      ? "text-danger"
      : "";

  const limitPnL = props.player.getConfig().limitPnL;
  const levelPnL = props.player.getConfig().levelPnL;
  const positionLimit = props.player.getConfig().positionLimit;

  const warningLostPnLClass =
    pnl <= warnLossPnLFactor * limitPnL ? "text-danger" : "";

  const positionDisplay = (openPosition, positionLimit) => {
    return (
      <div>
        <span>{openPosition}</span>
        <span className="fs-7"> / {positionLimit}</span>
      </div>
    );
  };

  return (
    <div>
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
            value={positionDisplay(openPosition, positionLimit)}
          />
          <PlayerStatusHeaderElement
            labelClassName={warningLostPnLClass}
            valueClassName={warningLostPnLClass}
            label="P&L"
            value={displayPnL}
          />
          <PlayerStatusHeaderElement
            label="Last"
            value={lastPrice && lastPrice.toFixed(1)}
            className="d-none d-md-flex"
          />

          {/* Level */}
          <OverlayTrigger
            key="tooltip-level"
            placement="top"
            overlay={
              <Tooltip id={`tooltip-level`}>
                <table className="table table-sm table-borderless w-100 mb-0">
                  <tbody>
                    {levelPnL !== "Infinity" && (
                      <tr>
                        <th className="text-start">Next Level P&L</th>
                        <td className="text-end">{levelPnL}</td>
                      </tr>
                    )}
                    <tr>
                      <th className="text-start">Max Loss P&L</th>
                      <td className="text-end">{limitPnL}</td>
                    </tr>
                  </tbody>
                </table>
              </Tooltip>
            }
          >
            <div
              className={`d-flex flex-column align-items-center`.trim()}
              role="button"
            >
              <span
                className={`player-status-label`}
                style={{
                  textDecoration: "underline",
                  textDecorationStyle: "dashed",
                }}
              >
                Level
              </span>
              <span className={`player-status-value fs-4`}>
                {props.player.configLevel + 1}
              </span>
            </div>
          </OverlayTrigger>
        </div>
      </div>

      {/* Config Indicators */}
      <div className="player-status-indicators d-flex justify-content-evenly">
        <div className={`p-2 ${warningLostPnLClass}`}>
          Max Loss P&L: {limitPnL.toLocaleString()}
        </div>
        <div className="p-2">Next Level P&L: {levelPnL.toLocaleString()}</div>
        <PlayerLevelIcons
          player={props.player}
          level={props.player.configLevel}
        />
      </div>
    </div>
  );
}
