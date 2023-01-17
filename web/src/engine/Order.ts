export enum OrderType {
  Market,
  Limit
}

export class Order {

  private _type: OrderType;
  private _qty: number;
  private _price: number;
  private _timestamp: number;

  //TODO: what is my price resolution (no decimals)

  constructor(type: OrderType, qty: number, price: number) {
    // player reference /id, timestamp/ordering,
    // type: market, limit, cancel  - think that's all we'll support initially
    // buy/sell, qty, price,
    // filled/remaining, other-side of order component

    //this._id = new uuid
    //this._playerId;
    //
    this._type = type;
    this._qty = qty;
    this._price = price;
    this._timestamp = Date.now();
  }

  get price(): number { return this._price };

  get orderType(): OrderType {
    return this._type;
  }
  get timestamp(): number {
    return this._timestamp;
  }
}

export default Order;