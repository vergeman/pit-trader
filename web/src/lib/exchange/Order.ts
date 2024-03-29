import { v4 as uuidv4 } from "uuid";

export enum OrderType {
  MARKET,
  LIMIT,
}

export enum OrderStatus {
  NEW,
  LIVE,
  FILL, //Partial fill
  COMPLETE,
  CANCELLED,
  REJECTED,
}

export interface TransactionReport {
  qty: number;
  price: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  orderType: OrderType;
  player_id: string;
  qty: number;
  orderQty: number,  //tracks remaining qty in Order counterpart
  price: number;
  timestamp: number;
  status: OrderStatus;
}

export class Order {
  private _id: string;
  private _player_id: string;
  private _orderType: OrderType;
  private _initialQty: number; // initial quantity
  private _qty: number; // working quantity
  private _qtyFilled: number; // filled quantity
  private _transactions: Transaction[];
  private _price: number;
  private _gesturePrice: number | undefined;
  private _player_isLive: boolean;
  private _status: OrderStatus;
  private _timestamp: number; //createdAt
  private _updatedAt: number; //updatedAt
  private _lastReported: number;

  //TODO: what is my price resolution (no decimals)
  //TODO: player submits hit/lift own order -> pre risk check
  constructor(
    player_id: string,
    orderType: OrderType,
    qty: number,
    price: number,
    gesturePrice?: number,
    player_isLive?: boolean,
  ) {
    this._player_id = player_id;
    this._orderType = orderType;
    this._initialQty = this._toFixedNum(qty);
    this._qty = this._toFixedNum(qty);
    this._price = this._toFixedNum(
      orderType === OrderType.LIMIT ? price : Number.NaN
    );
    this._gesturePrice = gesturePrice;
    this._player_isLive = player_isLive || false;

    this._id = uuidv4();
    this._qtyFilled = 0;
    this._transactions = [];
    this._status = OrderStatus.NEW;
    this._timestamp = Date.now();
    this._updatedAt = Date.now();
    this._lastReported = 0;
  }

  get gesturePrice(): number | undefined {
    return this._gesturePrice;
  }
  get player_isLive(): boolean {
    return this._player_isLive;
  }

  execute(oppOrder: Order): TransactionReport {
    //determine which qty to use Min
    //const initialQty = this.qty;
    const abs_qty = Math.min(Math.abs(this.qty), Math.abs(oppOrder.qty));

    //deduct & apply qtys
    const timestamp = Date.now();
    const qtyFilled = this._fill(abs_qty);
    const oppQtyFilled = oppOrder._fill(abs_qty);

    //decide price
    //use price of "opposing" order that's in ME
    //gesture can be anything, but want to execute at best price
    //e.g. can't trust new orders, but can trust prices in matching engine (ME
    //can be better)
    let price = oppOrder.price;

    //update both status
    this._checkSetComplete();
    oppOrder._checkSetComplete();

    //NB: "this" can be market or limit order
    //but oppOrder will be a limit (market order never joins the queue)
    //transactions reflect counterparty order
    this._transactions.push({
      id: uuidv4(),
      orderType: this.orderType,
      status:
        this.status === OrderStatus.COMPLETE
          ? OrderStatus.COMPLETE
          : OrderStatus.FILL,
      player_id: oppOrder.player_id,
      qty: qtyFilled,
      orderQty: Math.abs(this.qty),  //NB: qty already deducted in order
      price,
      timestamp,
    });

    oppOrder._transactions.push({
      id: uuidv4(),
      orderType: oppOrder.orderType,
      status:
        oppOrder.status === OrderStatus.COMPLETE
          ? OrderStatus.COMPLETE
          : OrderStatus.FILL,
      player_id: this.player_id,
      qty: oppQtyFilled,
      orderQty: Math.abs(oppOrder.qty), //NB: qty already deducted in order
      price,
      timestamp,
    });

    //updatedAt both orders
    this.updatedAt = timestamp;
    oppOrder.updatedAt = timestamp;

    return {
      qty: abs_qty,
      price,
      timestamp,
    };
  }

  //TODO: update when decide price "decimals"
  priceFilled(): number {
    if (this.orderType === OrderType.MARKET) {
      //wAvg
      let qtyPrice = 0;
      let totalQty = 0;

      for (let transaction of this.transactions) {
        qtyPrice += transaction.qty * transaction.price;
        totalQty += transaction.qty;
      }

      return qtyPrice / totalQty;
    }

    return this.price;
  }

  _checkSetComplete(): void {
    if (this.qty === 0) {
      this._status = OrderStatus.COMPLETE;
      this.updatedAt = Date.now();
    }
  }

  //deduct from qty
  _fill(num: number): number {
    if (this.qty > 0) {
      this.qty -= num;
      this._qtyFilled += num;
      this.updatedAt = Date.now();
      return -num;
    }
    if (this.qty < 0) {
      this.qty += num;
      this._qtyFilled -= num;
      this.updatedAt = Date.now();
      return num;
    }
    return 0;
  }

  cancelled() {
    this._status = OrderStatus.CANCELLED;
    this.updatedAt = Date.now();
  }
  reject() {
    this._status = OrderStatus.REJECTED;
    this.updatedAt = Date.now();
  }

  canTransact(oppOrder: Order): boolean {
    if (!oppOrder) return false;
    const canBuy = this.qty > 0 && this.price >= oppOrder.price;
    const canSell = this.qty < 0 && this.price <= oppOrder.price;
    return canBuy || canSell;
  }

  getNewTransactions(): Transaction[] {
    const numNew = this._transactions.length - this._lastReported;
    if (numNew) {
      const transactions = this._transactions.slice(this._lastReported);
      this._lastReported += numNew;
      return transactions;
    }
    return [];
  }

  get id(): string {
    return this._id;
  }
  get player_id(): string {
    return this._player_id;
  }
  _toFixedNum(num: number): number {
    return Number(num.toFixed(1));
  }
  get price(): number {
    return this._toFixedNum(this._price);
  }
  set price(num: number) {
    this._price = this._toFixedNum(num);
  }
  get initialQty(): number {
    return this._initialQty;
  }
  get qty(): number {
    return this._toFixedNum(this._qty);
  }
  set qty(num: number) {
    this._qty = this._toFixedNum(num);
  }
  get qtyFilled(): number {
    return this._qtyFilled;
  }
  set status(status: OrderStatus) {
    this._status = status;
  }
  get orderType(): OrderType {
    return this._orderType;
  }
  get timestamp(): number {
    return this._timestamp;
  }
  get updatedAt(): number {
    return this._updatedAt;
  }
  set updatedAt(timestamp) {
    this._updatedAt = timestamp;
  }
  get transactions(): Transaction[] {
    return this._transactions;
  }
  get status(): OrderStatus {
    return this._status;
  }
}

export default Order;
