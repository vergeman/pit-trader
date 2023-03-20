import { v4 as uuidv4 } from "uuid";

export enum OrderType {
  Market,
  Limit,
}

export enum OrderStatus {
  New,
  Live,
  Complete,
  Cancelled,
  Rejected,
}

export interface TransactionReport {
  qty: number;
  price: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  player_id: string;
  qty: number;
  price: number;
  timestamp: number;
}

export class Order {
  private _id: string;
  private _player_id: string;
  private _orderType: OrderType;
  private _qty: number; // initial quantity
  private _qtyFilled: number; // filled quantity
  private _transactions: Transaction[];
  private _price: number;
  private _status: OrderStatus;
  private _timestamp: number;

  //TODO: what is my price resolution (no decimals)
  //TODO: player submits hit/lift own order -> pre risk check
  constructor(
    player_id: string,
    orderType: OrderType,
    qty: number,
    price: number
  ) {
    this._player_id = player_id;
    this._orderType = orderType;
    this._qty = this._toFixedNum(qty);
    this._price = this._toFixedNum(orderType === OrderType.Limit ? price : Number.NaN);

    this._id = uuidv4();
    this._qtyFilled = 0;
    this._transactions = [];
    this._status = OrderStatus.New;
    this._timestamp = Date.now();
  }

  execute(oppOrder: Order): TransactionReport {
    //determine which qty to use Min
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
    let price = oppOrder.price

    //update both status
    this._checkSetComplete();
    oppOrder._checkSetComplete();

    //NB: "this" can be market or limit order
    //but oppOrder will be a limit (market order never joins the queue)
    //transactions reflect counterparty order
    this._transactions.push({
      id: uuidv4(),
      player_id: oppOrder.player_id,
      qty: qtyFilled,
      price,
      timestamp,
    });

    oppOrder._transactions.push({
      id: uuidv4(),
      player_id: this.player_id,
      qty: oppQtyFilled,
      price,
      timestamp,
    });

    return {
      qty: abs_qty,
      price,
      timestamp,
    };
  }

  //TODO: update when decide price "decimals"
  priceFilled(): number {
    if (this.orderType === OrderType.Market) {
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
      this._status = OrderStatus.Complete;
    }
  }

  //deduct from qty
  _fill(num: number): number {
    if (this.qty > 0) {
      this.qty -= num;
      this._qtyFilled += num;
      return -num;
    }
    if (this.qty < 0) {
      this.qty += num;
      this._qtyFilled -= num;
      return num;
    }
    return 0;
  }

  cancelled() {
    this._status = OrderStatus.Cancelled;
  }
  reject() {
    this._status = OrderStatus.Rejected;
  }

  canTransact(oppOrder: Order): boolean {
    if (!oppOrder) return false;
    const canBuy = this.qty > 0 && this.price >= oppOrder.price;
    const canSell = this.qty < 0 && this.price <= oppOrder.price;
    return canBuy || canSell;
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
  get transactions(): Transaction[] {
    return this._transactions;
  }
  get status(): OrderStatus {
    return this._status;
  }
}

export default Order;
