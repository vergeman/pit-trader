import MarketLoop from "./MarketLoop";
import GestureDecision from "../gesture/GestureDecision";

export enum EventType {
  NewsEvent,
  GestureDecisionEvent,
}

export interface IEvent {
  id: string;
  type: EventType;
  msg: string;
  duration: number; //ms
  marketLoop: MarketLoop;
  gestureDecision: GestureDecision;
  isActive: number;
  timeouts: NodeJS.Timeout[];
  createdAt: number;
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
  private _marketLoop: MarketLoop;
  private _gestureDecision: GestureDecision;
  private _isActive: number;
  private _timeouts: NodeJS.Timeout[];
  private _createdAt: number;

  constructor({
    id,
    type,
    msg,
    duration,
    marketLoop,
    gestureDecision,
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
    marketLoop: MarketLoop;
    gestureDecision: GestureDecision;
  }) {
    this._id = id;
    this._type = type;
    this._msg = msg;
    this._duration = duration;
    this._marketLoop = marketLoop;
    this._gestureDecision = gestureDecision;
    this._isActive = 0;
    this._timeouts = [];
    this._createdAt = Date.now();
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
  get marketLoop(): MarketLoop {
    return this._marketLoop;
  }
  get gestureDecision(): GestureDecision {
    return this._gestureDecision;
  }
  get timeouts(): NodeJS.Timeout[] {
    return this._timeouts;
  }
  set timeouts(t: NodeJS.Timeout[]) {
    this._timeouts = t;
  }
  get createdAt(): number {
    return this._createdAt;
  }
  begin(): void {
    console.log("[Event] begin");
  }

  end(): void {
    console.log("[Event] end");
  }

  cleanup() {
    this.isActive--;
    if (this.isActive === 0) {
      //this._event = null;
      this._timeouts = [];
    }
  }
  clearTimeouts() {
    for (const timeout of this._timeouts) {
      clearTimeout(timeout);
    }
  }

  delay(duration: number): Promise<void> {
    return new Promise((res) => setTimeout(res, duration));
  }

  expiry(): number {
    return this.createdAt + this.duration;
  }
}
export default Event;
