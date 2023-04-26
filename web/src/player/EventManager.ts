import { GestureDecisionEvent } from "./GestureDecisionEvent";
import { NewsEvent } from "./NewsEvent";
import {
  events,
  gestureDecisionEvents,
  buildGestureDecisionEventParams,
} from "./events.template";
import MarketLoop from "./MarketLoop";
import GestureDecision from "../gesture/GestureDecision";

export class EventManager {
  private _marketLoop: MarketLoop;
  private _gestureDecision: GestureDecision;
  private _event: GestureDecisionEvent | NewsEvent | null;

  constructor(marketLoop: MarketLoop, gestureDecision: GestureDecision) {
    this._marketLoop = marketLoop;
    this._gestureDecision = gestureDecision;
    this._event = null;
  }

  get marketLoop(): MarketLoop {
    return this._marketLoop;
  }
  set marketLoop(marketLoop: MarketLoop) {
    this.marketLoop = marketLoop;
  }
  get gestureDecision(): GestureDecision {
    return this._gestureDecision;
  }
  get event(): GestureDecisionEvent | NewsEvent | null {
    return this._event;
  }
  set event(e: GestureDecisionEvent | NewsEvent | null) {
    this._event = e;
  }

  hasEvent(): boolean {
    return !!(this._event && this._event.isActive);
  }

  //TODO: tie into fps somehow, this gets polled
  //there are a lot of calcEvents even 99% happens fairly often
  //generate(): Event | null {
  generate(prob: number = 0.99) {
    if (this.hasEvent()) return null;

    const randomProb = Math.random();
    if (randomProb < prob) return null;

    console.log("[EventManager] generate");

    const event = this._createEvent();

    this.event = event;

    return event;
  }

  //generates Event type
  //locks with hasEvent to prevent concurrent events but there's no hard rule
  _createEvent(): GestureDecisionEvent | NewsEvent | null {
    if (this.hasEvent()) return null;

    const getRandom = (events: any) => {
      const i = Math.floor(Math.random() * events.length);
      return events[i];
    };

    //NewsEvent
    const randomProb = Math.random();
    if (randomProb > 1) {
      const params = getRandom(events);
      const event = new NewsEvent({
        ...params,
        marketLoop: this.marketLoop,
        gestureDecision: this.gestureDecision,
      });
      return event;
    }

    //GestureDecisionEvent
    const gde = getRandom(gestureDecisionEvents);
    const price = this.marketLoop.getPrice();

    const params = buildGestureDecisionEventParams(gde, price);

    const event = new GestureDecisionEvent({
      ...params,
      marketLoop: this.marketLoop,
      gestureDecision: this.gestureDecision,
    });

    return event;
  }

  executeEvent() {
    if (!this.event) return false;
    this.event.begin();
  }

  //on game end
  reset() {
    this.event = null;
  }
}

export default EventManager;
