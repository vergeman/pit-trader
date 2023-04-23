import {
  GestureDecisionEvent,
  NewsEvent,
  Event,
  EventState,
  EventType,
} from "./Event";
import Order from "../engine/Order";
import { events, bossevents } from "./events.template";
import Player from "./Player";
import MarketLoop from "./MarketLoop";
import GestureDecision from "../gesture/GestureDecision";

export class EventManager {
  private _marketLoop: MarketLoop;
  private _gestureDecision: GestureDecision;
  private _hasEvent: number;
  private _event: GestureDecisionEvent | NewsEvent | null;
  private _eventState: EventState;
  private _timeouts: NodeJS.Timeout[];

  constructor(marketLoop: MarketLoop, gestureDecision: GestureDecision) {
    this._marketLoop = marketLoop;
    this._gestureDecision = gestureDecision;
    this._hasEvent = 0;
    this._event = null;
    this._eventState = EventState.None;
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
  get hasEvent() {
    return this._hasEvent;
  }
  set hasEvent(e) {
    this._hasEvent = e;
  }
  get event(): GestureDecisionEvent | NewsEvent | null {
    return this._event;
  }
  set event(e: GestureDecisionEvent | NewsEvent | null) {
    this._event = e;
  }
  get eventState(): EventState {
    return this._eventState;
  }
  set eventState(state: EventState) {
    this._eventState = state;
  }
  get timeouts(): NodeJS.Timeout[] {
    return this._timeouts;
  }
  set timeouts(timeouts: NodeJS.Timeout[]) {
    this._timeouts = timeouts;
  }
  //TODO: tie into fps somehow, this gets polled
  //there are a lot of calcEvents even 99% happens fairly often
  //generate(): Event | null {
  generate() {
    if (this.hasEvent) return null;

    const prob = Math.random();
    if (prob < 0.99) return null;

    //const event = this._createEvent();
    console.log("[EventManager] generate");
    const event = bossevents[0];
    this.event = event;

    return event;
  }

  //generates Event type

  //locks with hasEvent to prevent concurrent events for now
  //but there's no hard rule
  _createEvent(): Event | null {
    if (this.hasEvent) return null;
    //TODO: decide between boss and news (weight)?
    //create event types: Boss type vs Message Type?
    //are these even in conflict - we need to distinguish, but not necessarily
    // choose between them

    //Boss
    // let event = bossevents[0];
    // return event;

    //News
    //TODO: events make indicative its static file
    const i = Math.floor(Math.random() * events.length);

    this._event = events[i];

    return this._event;
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
    const newsEvent = this.event as NewsEvent;

    if (newsEvent.addPlayers) {
      this._addPlayers(newsEvent, this.marketLoop);
    }
    if (newsEvent.marketLoop.skipTurnThreshold) {
      this._skipTurnThreshold(newsEvent, this.marketLoop);
    }
    if (
      newsEvent.marketLoop.minTurnDelay &&
      newsEvent.marketLoop.maxTurnDelay
    ) {
      this._minMaxTurnDelay(newsEvent, this.marketLoop);
    }
  }

  reset() {
    this.eventState = EventState.None
    this.timeouts = [];
  }

  clearTimeouts() {
    for (const timeout of this.timeouts) {
      clearTimeout(timeout);
    }
  }

  _cleanup() {
    this.hasEvent--;
    if (this.hasEvent === 0) {
      this._event = null;
      this.timeouts = [];
    }
  }

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
    if (![EventState.Active, EventState.NoMatch].includes(this.eventState)) return this.eventState;

    const event = this.event as GestureDecisionEvent;

    console.log("[gestureDecisionOrderMatch] MATCHING", event.gesture, order);
    if (
      event.gesture.qty == order.qty &&
      event.gesture.price == order.gesturePrice &&
      event.gesture.orderType == order.orderType
    ) {
      this.eventState = EventState.Win;
      console.log(
        "[gestureDecisionOrderMatch] eventState MATCH",
        this.eventState
      );
    } else {
      this.eventState = EventState.NoMatch;
      console.log(
        "[gestureDecisionOrderMatch] eventState NO MATCH",
        this.eventState
      );
    }

    //MATCH
    if (this.eventState == EventState.Win) {
      console.log("[gestureDecisionOrderMatch] event", this.event);

      this.clearTimeouts();
      (this.event as GestureDecisionEvent).reset();
    }

    console.log("[gestureDecisionOrderMatch] eventState", this.eventState);

    return this.eventState;
  }

  /* Boss Event Stub */
  enableGestureDecisionOrderEvent(
    event: GestureDecisionEvent,
    gestureDecision: GestureDecision
  ) {
    //this without bind/arrow function refers to gestureDecision
    //with arrow in CameraGesture, refers to EventManager
    console.log("[GestureDecisionOrderEvent]", event, gestureDecision);
    this.hasEvent++;
    this.marketLoop.stop();
    console.log("[GestureDecisionOrderEvent] stop");

    //TODO: stash current timeout intervals for use in setTimeout
    //(e.g. overwritten in generic marketLoop.start)

    this.eventState = EventState.Active;

    //TODO: refactor onEnd() / reset() / cleanup() make it clearer

    //cleanup
    //attach to event for early terminate
    const reset = () => {
      //TODO: restore start with stashed time vars
      console.log("[GestureDecisionOrderEvent] Cleanup");

      if (this.eventState !== EventState.Win) {
        this.eventState = EventState.Lost;
      }

      event.onEnd();

      // this._cleanup();
      // this.marketLoop.start();

      console.log("[GestureDecisionOrderEvent] Cleanup hasEvent", this.hasEvent);

      return this.eventState;
    };

    event.reset = reset;
    const timeout = setTimeout(
      () => reset(),
      (event && event.duration) || 5000
    );
    this.timeouts.push(timeout);
  }

  /* Event add / remove Players, adjust delta, direction */
  _addPlayers(event: NewsEvent, marketLoop: MarketLoop) {
    this.hasEvent++;
    const price = marketLoop && marketLoop.getPrice();
    const npcPlayerManager = marketLoop.npcPlayerManager;
    console.log(
      "[Event] Start",
      this.hasEvent,
      event,
      npcPlayerManager.numPlayers,
      event.addPlayers
    );

    //add Players
    for (let i = 0; i < event.addPlayers; i++) {
      const player = new Player(`${event.id}-${i}`);
      player.group_id = event.id;
      player.delta = event.delta;
      player.forceDirection = event.forceDirection as 1 | -1 | null;

      npcPlayerManager.addPlayer(player);
      const orders = player.replenish(price);
      for (let order of orders) {
        marketLoop.me.process(order);
      }
    }

    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.hasEvent,
        event.id,
        npcPlayerManager.numPlayers
      );
      npcPlayerManager.markRemoveGroup(event.id);
      this._cleanup();
    }, event.duration);
  }

  /* Event skipTurnThreshold */
  _skipTurnThreshold(event: NewsEvent, marketLoop: MarketLoop) {
    this.hasEvent++;
    console.log(
      "[Event] Start",
      this.hasEvent,
      event,
      event.marketLoop.skipTurnThreshold
    );

    marketLoop.skipTurnThreshold = event.marketLoop.skipTurnThreshold;
    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.hasEvent,
        event,
        marketLoop.defaultSkipTurnThreshold
      );
      marketLoop.skipTurnThreshold = marketLoop.defaultSkipTurnThreshold;
      this._cleanup();
    }, event.duration);
  }

  /* Event min/maxTurnDelay */
  _minMaxTurnDelay(event: NewsEvent, marketLoop: MarketLoop) {
    this.hasEvent++;
    console.log(
      "[Event] Start",
      this.hasEvent,
      event,
      event.marketLoop.minTurnDelay,
      event.marketLoop.maxTurnDelay
    );
    marketLoop.stop();
    marketLoop.start(
      event.marketLoop.minTurnDelay,
      event.marketLoop.maxTurnDelay
    );

    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.hasEvent,
        marketLoop,
        marketLoop.defaultMinTurnDelay,
        marketLoop.defaultMaxTurnDelay
      );

      marketLoop.stop();
      marketLoop.start(
        marketLoop.defaultMinTurnDelay,
        marketLoop.defaultMaxTurnDelay
      );

      this._cleanup();
    }, event.duration);
  }
}

export default EventManager;
