export enum GestureType {
  QTY = "Qty", //+/- number
  PRICE = "Price", //number
  ACTION = "Action", //Cancel, Garbage
}

export enum GestureAction {
  None = "None",
  Buy = "Buy",
  Sell = "Sell",
  Market = "Market",
  Garbage = "Garbage",
  Cancel = "Cancel",
}

/*
 * 1 bid: {type: Price, action: Buy, value: 1, digit_length: 1}
 * offer 10: {type: Price, action: Sell, value: 10, digit_length: 2}
 * Market {type: Price, action: Buy/Sell, value: NaN, digit_length: 1}
 * for 10: {type: Qty, action: Buy, value: 10, digit_length: 2}
 * 20 at: {type: Qty, action: Sell, value: 20, digit_length: 2}
 * Cancel {type: Action, action: Cancel, value: NaN, digit_length: 1}
 * Garbage {type: Action, action: Garbage, value: NaN, digit_length: 1}
 */

export class Gesture {
  private _type: GestureType;
  private _action: GestureAction;
  private _value: number | null;
  private _prob: number | null;

  constructor(
    type: GestureType,
    action: GestureAction,
    value: number | null,
    probMax: number | null
  ) {
    this._type = type;
    this._action = action;
    this._value = value;
    this._prob = probMax;
  }

  get type(): GestureType {
    return this._type;
  }

  get action(): GestureAction {
    return this._action;
  }

  get value(): number | null {
    return this._value;
  }
  get prob(): number | null {
    return this._prob;
  }
  digit_length(): number {
    const digit_length = this._value === null ? 0 : String(this._value).length;
    return digit_length;
  }
}
