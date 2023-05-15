import { v4 as uuidv4 } from "uuid";
import { Order, Transaction, OrderStatus, OrderType } from "../engine/Order";
import { Configs } from "../Configs";

export class Player {
  private _id: string;
  private _group_id: string;
  private _name: string;
  private _isLive: boolean;
  private _markRemoved: boolean;
  private _markSkipped: boolean;
  /*
   * _delta: this is not position related, but a bias for price: new or updated
   * orders are incremented/decremented by delta from marketLoop.getPrice()
   *
   * see buidRepenishOrder()
   */
  private _delta: number;
  private _forceDirection: 1 | -1 | null;
  private _maxPnL: number;
  private _lostPnL: number | null;
  private _bonus: number;
  private _orders: Order[];
  private readonly _configs: Configs;
  private _configLevel: number;

  constructor(name: string, isLive: boolean = false, configs: Configs) {
    this._id = uuidv4();
    this._group_id = "0";
    this._name = name;
    this._isLive = isLive;
    this._markRemoved = false;
    this._markSkipped = false;
    this._delta = 0;
    this._forceDirection = null;
    this._maxPnL = 0;
    this._lostPnL = null;
    this._bonus = 0;
    this._orders = [];

    this._configs = configs;
    this._configLevel = 0;
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
  get markSkipped(): boolean {
    return this._markSkipped;
  }
  set markSkipped(flag: boolean) {
    this._markSkipped = flag;
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
  get forceDirection(): 1 | -1 | null {
    return this._forceDirection;
  }
  set forceDirection(val: 1 | -1 | null) {
    this._forceDirection = val;
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
  get configs(): Configs {
    return this._configs;
  }
  get configLevel(): number {
    return this._configLevel;
  }
  get bonus(): number {
    return this._bonus;
  }
  set bonus(num: number) {
    this._bonus = num;
  }
  addBonus(bonus: number): number {
    this.bonus += bonus;
    return this.bonus;
  }
  reset(): void {
    this.orders = [];
    this.maxPnL = 0;
    this.lostPnL = null;
    this.bonus = 0;
    this._configLevel = 0;
  }

  hasLiveBids(): boolean {
    return !!this.getLiveBids().length;
  }

  hasLiveOffers(): boolean {
    return !!this.getLiveOffers().length;
  }

  getLiveBids(): Order[] {
    return this.orders.filter(
      (order) => order.qty > 0 && order.status === OrderStatus.LIVE
    );
  }

  getLiveOffers(): Order[] {
    return this.orders.filter(
      (order) => order.qty < 0 && order.status === OrderStatus.LIVE
    );
  }

  addOrder(order: Order) {
    this.orders.push(order);
  }

  buildOrder(qty: number, price: number): Order {
    const order = new Order(this.id, OrderType.LIMIT, qty, price);
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

        pnl +=
          -transaction.qty *
          (price - fillPrice) *
          this._configs[this._configLevel].tick;
        //console.log("MTM", mtm, price, fillPrice, transaction)
      }
    }
    this.maxPnL = Math.max(pnl + this.bonus, this.maxPnL);
    return pnl + this.bonus;
  }

  //avgPrice of executed trades
  //
  //NB: deprecated: gets confusing over time - large favorable p&l and small
  //position -> low displayed weighted avg price.
  //Better off not using for now.
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
    return Number(avgPrice.toFixed(2));
  }

  orderHistories(): Transaction[] {
    const histories: Transaction[] = [];

    for (const order of this.orders) {
      for (let transaction of order.transactions) {
        //NB: flip qty as qty is compliment to order
        const t = {
          ...transaction,
          qty: -transaction.qty,
          orderQty: transaction.orderQty,
        };
        histories.push(t);
      }

      // fake a transaction to display a Cancelled Order
      // (we show completes and partials, it's strange not to show a cancel)
      if (order.status == OrderStatus.CANCELLED) {
        const t: Transaction = {
          id: order.id,
          orderType: order.orderType,
          player_id: order.player_id,
          qty: order.qty,
          orderQty: order.qty,
          price: order.price,
          status: OrderStatus.CANCELLED,
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
    if (pnl < this._configs[this._configLevel].limitPnL) {
      if (this.lostPnL === null) this.lostPnL = pnl;
      return true;
    }
    return false;
  }

  hasNextLevel(price: number) {
    const pnl = this.calcPnL(price);
    const config = this._configs[this._configLevel];
    return pnl >= Number(config.levelPnL);
  }

  incrementLevel() {
    this._configLevel = Math.min(
      this._configLevel + 1,
      this._configs.length - 1
    );
  }

  openPosition(): number {
    return this.orders.reduce((acc: number, order: Order) => {
      return acc + order.qtyFilled;
    }, 0);
  }

  //abs: false net number position submitted as orders
  //abs: true - want to avoid laddering e.g. +10/-10, +10/10 to that would
  //otherwise allow infinite position as long as both sides net avoid sum position detection
  workingPosition(abs: boolean = false): number {
    return this.orders
      .filter((order) => order.status == OrderStatus.LIVE)
      .reduce((acc: number, order: Order) => {
        const qty = abs ? Math.abs(order.qty) : order.qty;
        return acc + qty;
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

  buildReplenishOrder(bidOffer: -1 | 1, price: number, qtyMax?: number): Order {
    // add player's delta to shift depending on event; but default is 0
    const randomMax_delta = this.delta + this.generateRandomMax() / 10;

    //bring in qtyMax from config if not specified
    if (!qtyMax) {
      qtyMax = this.configs[this.configLevel].qtyMax;
    }
    const randomQty = bidOffer * this.generateRandomMax(qtyMax);

    //NB: when replenishing, new orders built "around" an initial price
    //bids: price - delta
    //offers: price + delta
    const order = this.buildOrder(
      randomQty,
      price - bidOffer * randomMax_delta
    );
    return order;
  }

  replenish(price: number, qtyMax?: number): Order[] {
    const orders = [];

    //for events that modify players
    if (this.forceDirection !== null) {
      const order = this.buildReplenishOrder(
        this.forceDirection,
        price,
        qtyMax
      );
      orders.push(order);
      this.addOrder(order);
      return orders;
    }

    if (!this.hasLiveBids()) {
      const order = this.buildReplenishOrder(1, price, qtyMax);
      orders.push(order);
      this.addOrder(order);
    }

    if (!this.hasLiveOffers()) {
      const order = this.buildReplenishOrder(-1, price, qtyMax);
      orders.push(order);
      this.addOrder(order);
    }

    return orders;
  }
}

export default Player;
