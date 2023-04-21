import {events, bossevents} from "./events.template.js";
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
  private _hasEvent: number;

  constructor() {
    this._hasEvent = 0;
  }

  get hasEvent() {
    return this._hasEvent;
  }
  set hasEvent(e) {
    this._hasEvent = e;
  }

  //generates Event type
  //locks with hasEvent to prevent concurrent events for now
  //but there's no hard rule
  createEvent() {
    if (this.hasEvent) return false;

    //TODO: decide between boss and news (weight)?
    //create event types: Boss type vs Message Type?
    //are these even in conflict - we need to distinguish, but not necessarily
    // choose between them

    //Boss
    // let event = bossevents[0];
    // return event;

    //News
    const i = Math.floor(Math.random() * events.length);

    const event = events[i];

    return event;
  }

  executeEvent(event: Event, marketLoop: MarketLoop) {

    if (event.id == "boss-1") {
      this._bossEvent(event, marketLoop);
      return;
    }
    if (event.addPlayers) {
      this._addPlayers(event, marketLoop);
    }
    if (event.marketLoop.skipTurnThreshold) {
      this._skipTurnThreshold(event, marketLoop);
    }
    if (event.marketLoop.minTurnDelay && event.marketLoop.maxTurnDelay) {
      this._minMaxTurnDelay(event, marketLoop);
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

    setTimeout( () => {

      //TODO: restore start with stashed time vars
      //marketLoop.start()
      this.hasEvent--;
    }, event.duration)

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
      this.hasEvent--;
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
      this.hasEvent--;
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

      this.hasEvent--;
    }, event.duration);
  }
}

export default EventManager;
