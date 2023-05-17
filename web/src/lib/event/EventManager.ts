import { GestureDecisionEvent, GestureDecisionEventState } from "./GestureDecisionEvent";
import { NewsEvent } from "./NewsEvent";
import {
  events,
  gestureDecisionEvents,
  buildGestureDecisionEventParams,
} from "../../player/events.template";
import MarketLoop from "../exchange/MarketLoop";
import GestureDecision from "../gesture/GestureDecision";
import { Configs } from "../../Configs";

export class EventManager {
  private _marketLoop: MarketLoop;
  private _gestureDecision: GestureDecision;
  private _event: GestureDecisionEvent | NewsEvent | null;
  private readonly _configs: Configs;
  private _configLevel: number;

  constructor(
    marketLoop: MarketLoop,
    gestureDecision: GestureDecision,
    configs: Configs
  ) {
    this._marketLoop = marketLoop;
    this._gestureDecision = gestureDecision;
    this._event = null;
    this._configs = configs;
    this._configLevel = 0;
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

  incrementLevel() {
    this._configLevel = Math.min(this._configLevel + 1, this._configs.length - 1);
  }

  //TODO: tie into fps somehow, this gets polled
  //there are a lot of calcEvents even 99% happens fairly often
  //generate(): Event | null {
  generate() {
    if (this.hasEvent()) return null;

    const randomProb = Math.random();
    if (randomProb > this._configs[this._configLevel].eventProbability) return null;

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
    if (
      randomProb >
      this._configs[this._configLevel].gestureDecisionEvent.probability
    ) {
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

    const bonus = this._configs[this._configLevel].gestureDecisionEvent.bonus;
    const duration =
      this._configs[this._configLevel].gestureDecisionEvent.duration;

    const event = new GestureDecisionEvent({
      ...params,
      bonus: bonus * Math.abs(params.gesture.qty),
      duration,
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
    this._configLevel = 0;
  }

  killEvent() {
    if (!this.event) return false;
    console.log("[EventManager] KillEvent", this.event)
    this.event.end();
    this.event.clearTimeouts();
    this.event.cleanup();
    if (this.event instanceof GestureDecisionEvent) {
      this.event.gestureDecisionEventState = GestureDecisionEventState.NONE;
    }
  }
}

export default EventManager;
