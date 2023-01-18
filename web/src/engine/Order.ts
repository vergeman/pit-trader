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

  execute(order:Order) {}

  get id(): string {
    return this._id;
  }

  get price(): number {
    return this._price;
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
