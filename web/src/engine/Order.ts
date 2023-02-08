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

export class Order {
  private _id: string;
  private _player_id: string;
  private _orderType: OrderType;
  private _qty: number; // initial quantity
  private _qtyFilled: number; // filled quantity
  private _orderFills: Order[];
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
    this._qty = qty;
    this._price = orderType === OrderType.Limit ? price : Number.NaN;

    this._id = uuidv4();
    this._qtyFilled = 0;
    this._orderFills = [];
    this._status = OrderStatus.New;
    this._timestamp = Date.now();
  }

  execute(oppOrder: Order): TransactionReport {
    //determine which qty to use Min
    const abs_qty = Math.min(Math.abs(this.qty), Math.abs(oppOrder.qty));

    //deduct & apply qtys
    this._fill(abs_qty);
    oppOrder._fill(abs_qty);

    //update both status
    this._checkSetComplete();
    oppOrder._checkSetComplete();

    //NB: "this" can be market or limit order
    //but oppOrder will be a limit (market order never joins the queue)
    this._orderFills.push(oppOrder);
    oppOrder._orderFills.push(this);

    //if it's a market order, we use whatever opposing price
    //otherwise limit v limit:
    //
    //if we're a buyer we pay the least (lowest offer), if seller we ask the
    //most (highest bid). this happens when submit a limit order price set
    //"through" the market, make sure to report the proper price
    let price = this.orderType === OrderType.Market ? oppOrder.price :
      this.qty > 0 ? Math.min(this.price, oppOrder.price) : Math.max(this.price, oppOrder.price);

    return {
      qty: abs_qty,
      price,
      timestamp: Date.now(),
    };
  }

  //TODO: update when decide price "decimals"
  priceFilled(): number {
    if (this.orderType === OrderType.Market) {
      //wAvg
      let qtyPrice = 0;
      let totalQty = 0;

      for (let order of this._orderFills) {
        qtyPrice += order.qtyFilled * order.price;
        totalQty += order.qtyFilled;
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
  _fill(num: number): void {
    if (this.qty > 0) {
      this.qty -= num;
      this._qtyFilled += num;
    }
    if (this.qty < 0) {
      this.qty += num;
      this._qtyFilled -= num;
    }
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
  get price(): number {
    return this._price;
  }
  set price(num: number) {
    this._price = num;
  }
  get qty(): number {
    return this._qty;
  }
  set qty(num: number) {
    this._qty = num;
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
  get orderFills(): Order[] {
    return this._orderFills;
  }
  get status(): OrderStatus {
    return this._status;
  }
}

export default Order;
