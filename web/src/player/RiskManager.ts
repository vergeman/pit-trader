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

  warnLimit(player: Player, orders?: Order[]): boolean {
    const _calcPositionLimit = this._calcPositions(player, orders);
    return _calcPositionLimit >= this._warnPositionLimit;
  }

  exceedsLimit(player: Player, orders?: Order[]): boolean {
    const _calcPositionLimit = this._calcPositions(player, orders);
    return _calcPositionLimit > this._positionLimit;
  }

  //returns sum: current executed position + current working orders position + any
  //potential orders
  _calcPositions(player: Player, potentialOrders?: Order[]): number {
    //calc potential orders - these have not been submitted to engine or
    //attached to player; so no notion of partial fills
    const potentialPosition = (potentialOrders || []).reduce(
      (acc: number, order: Order) => {
        return acc + order.qty;
      },
      0
    );

    //calc player executed, orders submitted but not filled, and potential order total
    return player.openPosition() + player.workingPosition() + potentialPosition;
  }
}
