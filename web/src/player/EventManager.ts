import { events, bossevents } from "./events.template.js";
import Player from "./Player";
import MarketLoop from "./MarketLoop";

export interface Event {
  id: string;
  msg: string;
  duration: number; //ms
  delta: number;
  forceDirection: 1 | -1 | number | null;
  addPlayers: number;
  marketLoop: {
    minTurnDelay: number;
    maxTurnDelay: number;
    skipTurnThreshold: number;
  };
}

export class EventManager {
  private _marketLoop: MarketLoop;
  private _hasEvent: number;
  private _event: Event | null;

  constructor(marketLoop: MarketLoop) {
    this._marketLoop = marketLoop;
    this._hasEvent = 0;
    this._event = null;
  }

  get marketLoop(): MarketLoop {
    return this._marketLoop;
  }
  set marketLoop(marketLoop: MarketLoop) {
    this.marketLoop = marketLoop;
  }
  get hasEvent() {
    return this._hasEvent;
  }
  set hasEvent(e) {
    this._hasEvent = e;
  }
  get event(): Event | null {
    return this._event;
  }
  set event(e: Event | null) {
    this._event = e;
  }

  //TODO: tie into fps somehow, this gets polled
  //there are a lot of calcEvents even 99% happens fairly often
  generate(): Event | null {
    if (this.hasEvent) return null;

    const prob = Math.random();
    if (prob < 0.99) return null;

    const event = this._createEvent();
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

    const event = this.event;

    if (event.id == "boss-1") {
      //this._bossEvent(event, this.marketLoop);
      return;
    }
    if (event.addPlayers) {
      this._addPlayers(event, this.marketLoop);
    }
    if (event.marketLoop.skipTurnThreshold) {
      this._skipTurnThreshold(event, this.marketLoop);
    }
    if (event.marketLoop.minTurnDelay && event.marketLoop.maxTurnDelay) {
      this._minMaxTurnDelay(event, this.marketLoop);
    }
  }

  _cleanup() {
    this.hasEvent--;
    if (this.hasEvent === 0) {
      this._event = null;
    }
  }

  /*
   * EVENTS
   */

  /* Boss Event Stub */
  _bossEvent(event: Event, marketLoop: MarketLoop) {
    this.hasEvent++;
    marketLoop.stop();

    //Match
    //TODO: write intercept() function
    //TODO: stash current timeout intervals for use in setTimeout

    //marketLoop.me.intercept(true, Order);

    setTimeout(() => {
      //TODO: restore start with stashed time vars
      //marketLoop.start()
      this._cleanup();
    }, event.duration);
  }

  /* Event add / remove Players, adjust delta, direction */
  _addPlayers(event: Event, marketLoop: MarketLoop) {
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
  _skipTurnThreshold(event: Event, marketLoop: MarketLoop) {
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
  _minMaxTurnDelay(event: Event, marketLoop: MarketLoop) {
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
