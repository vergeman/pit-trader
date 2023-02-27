import { v4 as uuidv4 } from "uuid";
import { Order, OrderStatus, OrderType } from "../engine/Order";

interface OrderRecord {
  id: string,
  qty: number;
  price: number;
}

interface PlayerConfig {
  readonly tick: number;
  readonly limitPL: number;
}

export class Player {
  private _id: string;
  private _name: string;
  private _isLive: boolean;
  private _delta: number;
  private _orders: Order[];
  private readonly _config: PlayerConfig;

  constructor(
    name: string,
    isLive: boolean = false,
    config: PlayerConfig = {
      tick: 1000,
      limitPL: -1000000,
    }
  ) {
    this._id = uuidv4();
    this._name = name;
    this._isLive = isLive;
    this._delta = 0;
    this._orders = [];

    this._config = config;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get isLive(): boolean {
    return this._isLive;
  }

  get orders(): Order[] {
    return this._orders;
  }

  get delta(): number {
    return this._delta;
  }

  set delta(d: number) {
    this._delta = d;
  }

  hasLiveBids(): boolean {
    return !!this.getLiveBids().length;
  }

  hasLiveOffers(): boolean {
    return !!this.getLiveOffers().length;
  }

  getLiveBids(): Order[] {
    return this.orders.filter(
      (order) => order.qty > 0 && order.status === OrderStatus.Live
    );
  }

  getLiveOffers(): Order[] {
    return this.orders.filter(
      (order) => order.qty < 0 && order.status === OrderStatus.Live
    );
  }

  addOrder(order: Order) {
    this.orders.push(order);
  }

  buildOrder(qty: number, price: number): Order {
    const order = new Order(this.id, OrderType.Limit, qty, price);
    return order;
  }

  calcMTM(price: number): number {
    let mtm = 0;
    //get all fills
    for (const order of this.orders) {
      //we loop transactions due to market orders whose price can vary
      for (let transaction of order.transactions) {
        //opposing order qtyFilled * mtm * tick
        //for opposite market orders, NaN so use order price
        const fillPrice = transaction.price || order.price;

        mtm += -transaction.qty * (price - fillPrice) * this._config.tick;
        //console.log("MTM", mtm, price, fillPrice, transaction)
      }
    }

    return mtm;
  }

  orderHistories(): OrderRecord[] {
    const histories: OrderRecord[] = [];

    for (const order of this.orders) {
      for (let transaction of order.transactions) {
        const record: OrderRecord = {
          id: transaction.id,
          qty: transaction.qty,
          price: transaction.price,
        };

        histories.push(record);
      }
    }
    return histories;
  }

  hasLost(price: number): boolean {
    return this.calcMTM(price) < this._config.limitPL;
  }

  //TODO: augment order.execute to have player carry a netPosition equivalent
  //variable vs this calcuation function
  openPosition(): number {
    return this.orders.reduce((acc: number, order: Order) => {
      return acc + order.qtyFilled;
    }, 0);
  }

  /*
   * 'NPC' behaviors
   */

  //ensure delta doesn't exceed own bid / offer
  //e is to prevent immediate self-execution
  //TODO: possible check range too large (e.g. generate gesture reachable orders
  //- range of 1) might not be a problem
  calcMaxBidOfferDelta(_default: number = 0.5): number {
    //TODO: set price granularity
    //also assumed in gestureDecision.calcOrderPrice (div by 10)
    const e = 0.1;
    const liveBids = this.getLiveBids().map((order) => order.price);
    const liveOffers = this.getLiveOffers().map((order) => order.price);

    const minOffer = Math.min(...liveOffers);
    const maxBid = Math.max(...liveBids);
    const range = minOffer - maxBid;

    if (Number.isFinite(range)) {
      return parseFloat((range - e).toPrecision(4));
    }

    return _default;
  }

  calcSkipTurn(skipTurnThresh: number = 0.33): boolean {
    return Math.random() <= skipTurnThresh;
  }

  generateRandomMax(qtyMax: number = 5): number {
    return Math.floor(Math.random() * qtyMax + 1);
  }

  buildReplenishOrder(
    bidOfferToggle: -1 | 1,
    price: number,
    qtyMax?: number,
    delta?: number
  ): Order {
    const _delta = this.generateRandomMax() / 10;
    const randomMax = bidOfferToggle * this.generateRandomMax(qtyMax);

    //NB: when replenishing, new orders built "around" an iniital price
    //bids: price - delta
    //offers: price + delta
    const order = this.buildOrder(
      randomMax,
      price - bidOfferToggle * (delta || _delta)
    );
    return order;
  }

  replenish(price: number, qtyMax?: number, delta?: number): Order[] {
    const orders = [];

    if (!this.hasLiveBids()) {
      const order = this.buildReplenishOrder(1, price, qtyMax, delta);
      orders.push(order);
      this.addOrder(order);
    }

    if (!this.hasLiveOffers()) {
      const order = this.buildReplenishOrder(-1, price, qtyMax, delta);
      orders.push(order);
      this.addOrder(order);
    }

    return orders;
  }
}

export default Player;
