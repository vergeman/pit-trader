import Order from "./Order";
import Player from "../player/Player";
import { Configs } from "../../config/Configs";

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

export interface OrdersLimit {
  total: number;
  working: number;
  orders: number;
  exceedsMaxOrder: boolean;
}

export default class RiskManager {
  private readonly _configs: Configs;
  private _configLevel: number;

  constructor(configs: Configs) {
    this._configs = configs;
    this._configLevel = 0;
  }

  reset() {
    this._configLevel = 0;
  }

  positionLimit(): number {
    return this._configs[this._configLevel].positionLimit || 25;
  }
  warnPositionLimit(): number {
    return this._configs[this._configLevel].warnPositionLimit || 5;
  }
  maxOrderLimit(): number {
    return this._configs[this._configLevel].maxOrderLimit || 40;
  }

  //maxOrder: absolute values
  //total of working and to-be-submmited should not exceed supplied limitValue
  exceedsMaxOrder(
    player: Player,
    limitValue: number,
    potentialOrders?: Order[]
  ): OrdersLimit {
    const working = player.workingPosition(true);
    const orders = this.orderPosition(true, potentialOrders);
    const total = working + orders;
    const exceedsMaxOrder = total > limitValue;
    return {
      total,
      working,
      orders,
      exceedsMaxOrder,
    };
  }

  incrementLevel() {
    this._configLevel = Math.min(this._configLevel + 1, this._configs.length - 1);
  }

  //this._positionLimit or this._warnPositionLimit;
  exceedsLimit(
    player: Player,
    limitValue: number,
    orders?: Order[]
  ): PositionsLimit {
    const positions = this._calcPositions(player, orders);
    return {
      ...positions,
      exceedsLimit: Math.abs(positions.total) > limitValue,
    };
  }

  //calc potential orders - these have not been submitted to engine or
  //attached to player; so no notion of partial fills
  //abs: false - net sum
  //abs: true - absolute sum
  orderPosition(abs: boolean = false, potentialOrders?: Order[]): number {
    const potentialPosition = (potentialOrders || []).reduce(
      (acc: number, order: Order) => {
        const qty = abs ? Math.abs(order.qty) : order.qty;
        return acc + qty;
      },
      0
    );
    return potentialPosition;
  }

  //returns net sum: current executed position + current working orders position + any
  //potential orders
  //open: current position (net)
  //working: submitted orders (net)
  //orders: to-be-submitted orders (net - abs: false)
  _calcPositions(player: Player, potentialOrders?: Order[]): Positions {
    const open = player.openPosition();
    const working = player.workingPosition();
    const orders = this.orderPosition(false, potentialOrders);

    //calc current player position, orders submitted and live but not filled,
    //and potential order yet-to-be-submitted
    return {
      total: open + working + orders,
      open,
      working,
      orders,
    };
  }
}
