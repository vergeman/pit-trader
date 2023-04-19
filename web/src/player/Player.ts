import { v4 as uuidv4 } from "uuid";
import { Order, Transaction, OrderStatus, OrderType } from "../engine/Order";

interface PlayerConfig {
  readonly tick: number;
  readonly limitPL: number;
}

export class Player {
  private _id: string;
  private _group_id: string;
  private _name: string;
  private _isLive: boolean;
  private _markRemoved: boolean;
  /*
   * _delta: this is not position related, but a bias for price: new or updated
   * orders are incremented/decremented by delta from marketLoop.getPrice()
   *
   * see buidRepenishOrder()
   */
  private _delta: number;
  private _maxPnL: number;
  private _lostPnL: number | null;
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
    this._group_id = "0";
    this._name = name;
    this._isLive = isLive;
    this._markRemoved = false;
    this._delta = 0;
    this._maxPnL = 0;
    this._lostPnL = null;
    this._orders = [];

    this._config = config;
  }

  get id(): string {
    return this._id;
  }
  get group_id(): string {
    return this._group_id;
  }
  set group_id(group_id) {
    this._group_id = group_id;
  }
  get name(): string {
    return this._name;
  }

  get isLive(): boolean {
    return this._isLive;
  }
  get markRemoved(): boolean {
    return this._markRemoved;
  }
  set markRemoved(flag: boolean) {
    this._markRemoved = flag;
  }
  get orders(): Order[] {
    return this._orders;
  }

  set orders(orders: Order[]) {
    this._orders = orders;
  }

  get delta(): number {
    return this._delta;
  }

  set delta(d: number) {
    this._delta = d;
  }
  get maxPnL(): number {
    return this._maxPnL;
  }
  set maxPnL(num: number) {
    this._maxPnL = num;
  }
  get lostPnL(): number | null {
    return this._lostPnL;
  }
  set lostPnL(val) {
    this._lostPnL = val;
  }
  reset(): void {
    this.orders = [];
    this.maxPnL = 0;
    this.lostPnL = null;
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

  calcPnL(price: number): number {
    let pnl = 0;
    //get all fills
    for (const order of this.orders) {
      //we loop transactions due to market orders whose price can vary
      for (let transaction of order.transactions) {
        //opposing order qtyFilled * mtm * tick
        //for opposite market orders, NaN so use order price
        const fillPrice = transaction.price || order.price;

        pnl += -transaction.qty * (price - fillPrice) * this._config.tick;
        //console.log("MTM", mtm, price, fillPrice, transaction)
      }
    }
    this.maxPnL = Math.max(pnl, this.maxPnL);
    return pnl;
  }

  //avgPrice of executed trades
  calcDisplayAvgPrice(): number | null {
    let pnl = 0;
    let fillQty = 0;

    //get all fills
    for (const order of this.orders) {
      //we loop transactions due to market orders whose price can vary
      for (let transaction of order.transactions) {
        //opposing order qtyFilled * mtm * tick
        //for opposite market orders, NaN so use order price
        const fillPrice = transaction.price || order.price;
        fillQty += transaction.qty;
        pnl += -transaction.qty * fillPrice;
      }
    }

    if (fillQty == 0) return null;

    const avgPrice = Math.abs(pnl / fillQty);
    return Number(avgPrice.toFixed(3));
  }

  orderHistories(): Transaction[] {
    const histories: Transaction[] = [];

    for (const order of this.orders) {
      for (let transaction of order.transactions) {
        //NB: flip qty as qty is compliment to order
        const t = { ...transaction, qty: -transaction.qty };
        histories.push(t);
      }

      // fake a transaction to display a Cancelled Order
      // (we show completes and partials, it's strange not to show a cancel)
      if (order.status == OrderStatus.Cancelled) {
        const t: Transaction = {
          id: order.id,
          orderType: order.orderType,
          player_id: order.player_id,
          qty: order.qty,
          price: order.price,
          status: OrderStatus.Cancelled,
          timestamp: order.updatedAt,
        };

        histories.push(t);
      }
    }
    return histories.sort((a: Transaction, b: Transaction) =>
      Number(a.timestamp < b.timestamp)
    );
  }

  // determine if lost, and if so, freeze that pnl number for display.
  // marketLoop setTimeout can cause sight drift before marketLoop stop
  hasLost(price: number): boolean {
    const pnl = this.calcPnL(price);
    if (pnl < this._config.limitPL) {
      if (this.lostPnL === null) this.lostPnL = pnl;
      return true;
    }
    return false;
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

  //used by npc in marketloop to update orders
  //ensure delta doesn't exceed own bid / offer
  //e is to prevent immediate self-execution
  //
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
      const val = range - e;
      const delta = Math.round(val * 10) / 10;
      return delta;
    }

    return _default;
  }

  calcSkipTurn(skipTurnThresh: number = 0.33): boolean {
    return Math.random() <= skipTurnThresh;
  }

  /*
   * returns integer range bound value [1, 5]. This is to ensure price +/- delta
   * remains in an accessible range to be acted on in the marketLoop.
   *
   * e.g. price is 103.5, a .5 delta caps the order price to 103.0 or 104.0,
   * versus something further away.
   */
  generateRandomMax(numMax: number = 5): number {
    return Math.floor(Math.random() * numMax + 1);
  }

  buildReplenishOrder(
    bidOffer: -1 | 1,
    price: number,
    qtyMax?: number,
    delta_override?: number
  ): Order {
    const randomMax_delta = this.generateRandomMax() / 10;
    const randomQty = bidOffer * this.generateRandomMax(qtyMax);

    //NB: when replenishing, new orders built "around" an initial price
    //bids: price - delta
    //offers: price + delta
    const order = this.buildOrder(
      randomQty,
      price - bidOffer * (delta_override || randomMax_delta)
    );
    return order;
  }

  replenish(price: number, qtyMax?: number, delta_override?: number): Order[] {
    const orders = [];

    if (!this.hasLiveBids()) {
      const order = this.buildReplenishOrder(1, price, qtyMax, delta_override);
      orders.push(order);
      this.addOrder(order);
    }

    if (!this.hasLiveOffers()) {
      const order = this.buildReplenishOrder(-1, price, qtyMax, delta_override);
      orders.push(order);
      this.addOrder(order);
    }

    return orders;
  }
}

export default Player;
