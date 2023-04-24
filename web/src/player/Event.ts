import { GestureAction } from "../gesture/Gesture";
import { OrderType } from "../engine/Order";

export enum EventType {
  NewsEvent,
  GestureDecisionEvent,
}

//corresponds to component visuals
export enum GestureDecisionEventState {
  None,
  Active, //initial screen
  NoMatch, //submit a miss
  Win, //matched event w/ order
  Lost, //expired
}

export interface GestureDecisionEvent extends Event {
  img: string;
  bonus: number;
  gesture: {
    qty: number;
    price: number;
    orderType: OrderType;
  };
  onEnd: () => void;
  reset: () => void;
}

export interface IEvent {
  id: string;
  type: EventType;
  msg: string;
  duration: number; //ms
  isActive: number;

  begin(): void;
  end(): void;
  //reset?
  //cleanup?
}

export class Event implements IEvent {
  private _id: string;
  private _type: EventType;
  private _msg: string;
  private _duration: number;
  private _isActive: number;

  constructor({
    id,
    type,
    msg,
    duration,
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
  }) {
    this._id = id;
    this._type = type;
    this._msg = msg;
    this._duration = duration;
    this._isActive = 0;
  }

  get id(): string {
    return this._id;
  }
  get type(): EventType {
    return this._type;
  }
  get msg(): string {
    return this._msg;
  }
  get duration(): number {
    return this._duration;
  }
  get isActive(): number {
    return this._isActive;
  }
  set isActive(num: number) {
    this._isActive = num;
  }

  begin(): void {
    console.log("[Event] begin");
  }

  end(): void {
    console.log("[Event] end");
  }


  cleanup() {
    this.isActive--;
    //if (this.isActive === 0) {
      //this._event = null;
      //this.timeouts = [];
    //}
  }

  delay(duration: number): Promise<void> {
    return new Promise(res => setTimeout(res, duration));
  }
}
export default Event;
