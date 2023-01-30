import { v4 as uuidv4 } from "uuid";
import Order from "../engine/Order";

export class Player {
  private _id: string;
  private _name: string;
  private _orders: Order[];

  constructor(name: string) {
    this._id = uuidv4();
    this._name = name;

    this._orders = [];
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get orders(): Order[] {
    return this._orders;
  }
}

export default Player;
