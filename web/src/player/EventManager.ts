import { Event, EventType } from "./Event";
import {
  GestureDecisionEvent,
  GestureDecisionEventState,
} from "./GestureDecisionEvent";
import { NewsEvent } from "./NewsEvent";
import Order from "../engine/Order";
import { events, bossevents } from "./events.template";
import Player from "./Player";
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

    // console.log("[EventManager] generate");

    //News event
    const event = this._createEvent();

    //Boss Event
    // const event = bossevents[0];

    this.event = event;

    return event;
  }

  //generates Event type

  //locks with hasEvent to prevent concurrent events for now
  //but there's no hard rule
  _createEvent(): GestureDecisionEvent | NewsEvent | null {
    if (this.hasEvent()) return null;
    //TODO: decide between boss and news (weight)?
    //TODO: make events indicative its loading from static source
    //create event types: Boss type vs Message Type?
    //are these even in conflict - we need to distinguish, but not necessarily
    // choose between them

    //News
    // const i = Math.floor(Math.random() * events.length);
    // const news = events[i];
    //this.event = new NewsEvent({ ...news, marketLoop: this.marketLoop, gestureDecision: this.gestureDecision});

    //news old
    //this._event = events[i] as NewsEvent;

    //Boss
    const event = bossevents[0];
    this.event = new GestureDecisionEvent({
      ...event,
      marketLoop: this.marketLoop,
      gestureDecision: this.gestureDecision,
    });
    return this.event;
  }

  executeEvent() {
    if (!this.event) return false;
    this.event.begin();
  }
}

export default EventManager;
