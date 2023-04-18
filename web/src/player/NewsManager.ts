export interface Event {
  msg: string;
  duration: number; //ms
  delta: number;
  direction: -1 | 1;
  numPlayer: number;
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
  createEvent() {
    if (this.hasEvent) return false;

    this.hasEvent = true;

    //TODO: import Event templates from json?
    //make random selection of template
    const event: Event = {
      msg: `hi-${this._id}`,
      duration: 3000,
      delta: 1,
      direction: 1,
      numPlayer: 0,
    };

    this._id++;

    setTimeout(() => (this.hasEvent = false), event.duration);

    return event;
  }
}

export default NewsManager;
