import Order from "../engine/Order";
import Player from "./Player";

export interface Positions {
  total: number;
  open: number;
  working: number;
  orders: number; //pre-submit
}

export interface PositionsLimit extends Positions {
  warnLimit?: boolean;
  exceedsLimit?: boolean;
}

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

  warnLimit(player: Player, orders?: Order[]): PositionsLimit {
    const positions = this._calcPositions(player, orders);
    return {
      ...positions,
      warnLimit: positions.total >= this._warnPositionLimit,
    };
  }

  exceedsLimit(player: Player, orders?: Order[]): PositionsLimit {
    const positions = this._calcPositions(player, orders);
    return {
      ...positions,
      exceedsLimit: positions.total > this._positionLimit,
    };
  }

  //calc potential orders - these have not been submitted to engine or
  //attached to player; so no notion of partial fills
  orderPosition(potentialOrders?: Order[]): number {
    const potentialPosition = (potentialOrders || []).reduce(
      (acc: number, order: Order) => {
        return acc + order.qty;
      },
      0
    );
    return potentialPosition;
  }

  //returns sum: current executed position + current working orders position + any
  //potential orders
  _calcPositions(player: Player, potentialOrders?: Order[]): Positions {
    const open = player.openPosition();
    const working = player.workingPosition();
    const orders = this.orderPosition(potentialOrders);

    //calc player executed, orders submitted but not filled, and potential order total
    return {
      total: open + working + orders,
      open,
      working,
      orders,
    };
  }
}
