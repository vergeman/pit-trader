import {
  GestureDecisionEvent,
  Event,
  GestureDecisionEventState,
  EventType,
} from "./Event";
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
  private _gestureDecisionEventState: GestureDecisionEventState;
  private _timeouts: NodeJS.Timeout[];

  constructor(marketLoop: MarketLoop, gestureDecision: GestureDecision) {
    this._marketLoop = marketLoop;
    this._gestureDecision = gestureDecision;
    this._event = null;
    this._gestureDecisionEventState = GestureDecisionEventState.None;
    this._timeouts = [];
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
  get gestureDecisionEventState(): GestureDecisionEventState {
    return this._gestureDecisionEventState;
  }
  set gestureDecisionEventState(state: GestureDecisionEventState) {
    this._gestureDecisionEventState = state;
  }
  get timeouts(): NodeJS.Timeout[] {
    return this._timeouts;
  }
  set timeouts(timeouts: NodeJS.Timeout[]) {
    this._timeouts = timeouts;
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
    const i = Math.floor(Math.random() * events.length);
    const news = events[i];
    this.event = new NewsEvent({ ...news });
    //news old
    //this._event = events[i] as NewsEvent;

    //Boss
    //this._event = bossevents[0];
    return this.event;
  }

  executeEvent() {
    if (!this.event) return false;

    //GestureDecisionEvents
    const gdEvent = this.event as GestureDecisionEvent;

    if (gdEvent.type === EventType.GestureDecisionEvent) {
      this.enableGestureDecisionOrderEvent(gdEvent, this.gestureDecision);
      return;
    }

    //NewsEvents
    //const newsEvent = this.event as NewsEvent;
    //newsEvent.begin(this.marketLoop)

    this.event.begin(this.marketLoop);
  }

  reset() {
    this.gestureDecisionEventState = GestureDecisionEventState.None;
    this.timeouts = [];
  }

  clearTimeouts() {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }

  // cleanup() {
  //   this.hasEvent--;
  //   if (this.hasEvent === 0) {
  //     this._event = null;
  //     this.timeouts = [];
  //   }
  // }

  /*
   * EVENTS
   */

  gestureDecisionOrderMatch(order: Order, gestureDecision: GestureDecision) {
    //TODO: move the events / marketLoop to one time  - executeEvent
    //the match function is the callback

    /*
     * Match
     */
    //if none, win, lost - event doesn't exist or is over, so no gesture comparison
    //if active/nomatch it's ongoing
    //make sure once a state changes we lock
    if (
      ![
        GestureDecisionEventState.Active,
        GestureDecisionEventState.NoMatch,
      ].includes(this.gestureDecisionEventState)
    )
      return this.gestureDecisionEventState;

    const event = this.event as GestureDecisionEvent;

    console.log("[gestureDecisionOrderMatch] MATCHING", event.gesture, order);
    if (
      event.gesture.qty == order.qty &&
      event.gesture.price == order.gesturePrice &&
      event.gesture.orderType == order.orderType
    ) {
      this.gestureDecisionEventState = GestureDecisionEventState.Win;
      console.log(
        "[gestureDecisionOrderMatch] gestureDecisionEventState MATCH",
        this.gestureDecisionEventState
      );
    } else {
      this.gestureDecisionEventState = GestureDecisionEventState.NoMatch;
      console.log(
        "[gestureDecisionOrderMatch] gestureDecisionEventState NO MATCH",
        this.gestureDecisionEventState
      );
    }

    //MATCH
    if (this.gestureDecisionEventState == GestureDecisionEventState.Win) {
      console.log("[gestureDecisionOrderMatch] event", this.event);

      this.clearTimeouts();
      (this.event as GestureDecisionEvent).reset();
    }

    console.log(
      "[gestureDecisionOrderMatch] gestureDecisionEventState",
      this.gestureDecisionEventState
    );

    return this.gestureDecisionEventState;
  }

  /* Boss Event Stub */
  enableGestureDecisionOrderEvent(
    event: GestureDecisionEvent,
    gestureDecision: GestureDecision
  ) {
    //this without bind/arrow function refers to gestureDecision
    //with arrow in CameraGesture, refers to EventManager
    console.log("[GestureDecisionOrderEvent]", event, gestureDecision);
    //this.hasEvent++;
    this.hasEvent();
    this.marketLoop.stop();
    console.log("[GestureDecisionOrderEvent] stop");

    //TODO: stash current timeout intervals for use in setTimeout
    //(e.g. overwritten in generic marketLoop.start)

    this.gestureDecisionEventState = GestureDecisionEventState.Active;

    //TODO: refactor onEnd() / reset() / cleanup() make it clearer

    //cleanup
    //attach to event for early terminate
    const reset = () => {
      //TODO: restore start with stashed time vars
      console.log("[GestureDecisionOrderEvent] Cleanup");

      if (this.gestureDecisionEventState !== GestureDecisionEventState.Win) {
        this.gestureDecisionEventState = GestureDecisionEventState.Lost;
      }

      event.onEnd();

      // this.cleanup();
      // this.marketLoop.start();

      console.log(
        "[GestureDecisionOrderEvent] Cleanup hasEvent",
        this.hasEvent()
      );

      return this.gestureDecisionEventState;
    };

    event.reset = reset;
    const timeout = setTimeout(
      () => reset(),
      (event && event.duration) || 5000
    );
    this.timeouts.push(timeout);
  }

}

export default EventManager;
