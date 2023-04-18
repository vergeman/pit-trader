import events from "./events.template.js";
export interface Event {
  msg: string;
  duration: number; //ms
  delta: number;
  direction: number | 1 | -1;
  numPlayer: number;
  minTurnDelay: number;
  maxTurnDelay: number;
  //turn time number? e.g. increase/decrease marketLoop frenzy
}

export class NewsManager {
  private _hasEvent: boolean;
  private _id: number;

  constructor() {
    this._hasEvent = false;
    this._id = 0;
  }

  get hasEvent() {
    return this._hasEvent;
  }
  set hasEvent(e) {
    this._hasEvent = e;
  }

  //generates Event types
  createEvent(): Event | false {
    if (this.hasEvent) return false;

    this.hasEvent = true;

    const i = Math.floor(Math.random() * events.length);

    const event = events[i];

    return event;
  }
}

export default NewsManager;
