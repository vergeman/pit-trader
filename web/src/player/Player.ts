import { v4 as uuidv4 } from "uuid";
import { Order, OrderStatus, OrderType } from "../engine/Order";

export class Player {
  private _id: string;
  private _name: string;
  private _isLive: boolean;
  private _delta: number;
  private _orders: Order[];

  constructor(name: string, isLive: boolean = false) {
    this._id = uuidv4();
    this._name = name;
    this._isLive = isLive;
    this._delta = 0;
    this._orders = [];
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

  buildOrder(qty: number, price: number): Order {
    const order = new Order(this.id, OrderType.Limit, qty, price);
    return order;
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

  //ensure delta doesn't exceed own bid / offer
  //e is to prevent immediate self-execution
  //TODO: possible check range too large (e.g. generate gesture reachable orders
  //- range of 1) might not be a problem
  calcMaxBidOfferDelta(_default: number = 0.5): number {
    const e = 0.1; //TODO: set price granularity
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

  addOrder(order: Order) {
    this.orders.push(order);
  }

  generateRandomMax(qtyMax: number = 5): number {
    return Math.floor(Math.random() * qtyMax + 1);
  }

  replenish(price: number, qtyMax?: number, delta?: number): Order[] {
    const orders = [];

    if (!this.hasLiveBids()) {
      //generate own random delta if not passed as param
      const _delta = this.generateRandomMax() / 10;
      const randomMax = this.generateRandomMax(qtyMax);
      const bidOrder = this.buildOrder(randomMax, price - (delta || _delta));
      orders.push(bidOrder);
      this.addOrder(bidOrder);
    }

    if (!this.hasLiveOffers()) {
      const _delta = this.generateRandomMax() / 10;
      const randomMax = this.generateRandomMax(qtyMax);
      const offerOrder = this.buildOrder(
        -this.generateRandomMax(randomMax),
        price + (delta || _delta)
      );
      orders.push(offerOrder);
      this.addOrder(offerOrder);
    }
    return orders;
  }
}

export default Player;
