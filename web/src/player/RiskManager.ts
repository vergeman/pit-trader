import Order from "../engine/Order";
import Player from "./Player";

export default class RiskManager {
  private _positionLimit: number;
  private _warnPositionLimit: number;

  constructor({
    positionLimit,
    warnPositionLimit,
  }: {
    positionLimit?: number;
    warnPositionLimit?: number;
  }) {
    this._positionLimit = positionLimit || 25;
    this._warnPositionLimit = warnPositionLimit || 5;
  }

  get positionLimit(): number {
    return this._positionLimit;
  }
  get warnPositionLimit(): number {
    return this._warnPositionLimit;
  }

  //check limits before submitting additional order
  check(player: Player, order: Order) {}

  isWarn(player: Player) {}

  calcLimit(player: Player, orders: Order[]) {}

  _calcPositions(player: Player, orders: Order[]) {}
}
