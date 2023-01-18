import { v4 as uuidv4 } from "uuid";

export enum OrderType {
  Market,
  Limit,
}

export enum Status {
  New,
  Live,
  Complete,
  Cancelled,
  Rejected,
}

export class Order {
  private _id: string;
  private _player_id: string;
  private _orderType: OrderType;
  private _qty: number; // initial quantity
  private _qtyFilled: number; // filled quantity
  private _orderFills: Order[];
  private _price: number;
  private _status: Status;
  private _timestamp: number;

  //TODO: what is my price resolution (no decimals)

  constructor(
    player_id: string,
    orderType: OrderType,
    qty: number,
    price: number
  ) {
    this._player_id = player_id;
    this._orderType = orderType;
    this._qty = qty;
    this._price = price;

    this._id = uuidv4();
    this._qtyFilled = 0;
    this._orderFills = [];
    this._status = Status.New;
    this._timestamp = Date.now();
  }

  execute(oppOrder: Order) {
    //determine which qty to use Min
    const abs_qty = Math.min(Math.abs(this.qty), Math.abs(oppOrder.qty));

    //deduct & apply qtys
    this._fill(abs_qty);
    oppOrder._fill(abs_qty);

    //update both status
    this._checkSetComplete();
    oppOrder._checkSetComplete();

    //TODO: not sure
    //add to orderFills[] in both sides?
    this._orderFills.push(oppOrder);
    oppOrder._orderFills.push(this);
  }

  _checkSetComplete(): void {
    if (this.qty === 0) {
      this._status = Status.Complete;
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

  reject() {
    //status reject
    this._status = Status.Rejected;
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

  get price(): number {
    return this._price;
  }
  get qty(): number {
    return this._qty;
  }
  set qty(num: number) {
    this._qty = num;
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
}

export default Order;
