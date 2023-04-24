import { IEvent, Event, EventType } from "./Event";
import MarketLoop from "./MarketLoop";
import Player from "./Player";

export interface INewsEvent extends IEvent {
  delta: number;
  forceDirection: 1 | -1 | number | null;
  addPlayers: number;
  marketLoopConfig: {
    minTurnDelay: number;
    maxTurnDelay: number;
    skipTurnThreshold: number;
  };
}

export class NewsEvent extends Event implements INewsEvent {
  private _delta: number;
  private _forceDirection: 1 | -1 | number | null;
  private _addPlayers: number;
  private _marketLoopConfig: {
    minTurnDelay: number;
    maxTurnDelay: number;
    skipTurnThreshold: number;
  };

  constructor({
    id,
    type,
    msg,
    duration,
    delta,
    forceDirection,
    addPlayers,
    marketLoopConfig,
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
    delta: number;
    forceDirection: INewsEvent["forceDirection"];
    addPlayers: number;
    marketLoopConfig: INewsEvent["marketLoopConfig"];
  }) {
    super({ id, type, msg, duration });
    this._delta = delta;
    this._forceDirection = forceDirection;
    this._addPlayers = addPlayers;
    this._marketLoopConfig = marketLoopConfig;
  }

  get delta(): number {
    return this._delta;
  }
  get forceDirection(): INewsEvent["forceDirection"] {
    return this._forceDirection;
  }
  get addPlayers(): number {
    return this._addPlayers;
  }
  get marketLoopConfig(): INewsEvent["marketLoopConfig"] {
    return this._marketLoopConfig;
  }


  begin(marketLoop?: MarketLoop): void {

    if (!marketLoop) return;

    super.begin();

    if (this.addPlayers) {
      this._addMarketLoopPlayers(marketLoop);
    }
    if (this.marketLoopConfig.skipTurnThreshold) {
      this._skipTurnThreshold(marketLoop);
    }
    if (
      this.marketLoopConfig.minTurnDelay &&
      this.marketLoopConfig.maxTurnDelay
    ) {
      this._minMaxTurnDelay(marketLoop);
    }
  }

  end() {
    super.end();
  }

  /*
   *
   */

  /* Event add / remove Players, adjust delta, direction */
  _addMarketLoopPlayers(marketLoop: MarketLoop) {
    this.isActive++;
    const price = marketLoop && marketLoop.getPrice();
    const npcPlayerManager = marketLoop.npcPlayerManager;
    console.log(
      "[Event] Start",
      this.isActive,
      this,
      npcPlayerManager.numPlayers,
      this.addPlayers
    );

    //add Players
    for (let i = 0; i < this.addPlayers; i++) {
      const player = new Player(`${this.id}-${i}`);
      player.group_id = this.id;
      player.delta = this.delta;
      player.forceDirection = this.forceDirection as (1 | -1 | null);

      npcPlayerManager.addPlayer(player);
      const orders = player.replenish(price);
      for (let order of orders) {
        marketLoop.me.process(order);
      }
    }

    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.isActive,
        this.id,
        npcPlayerManager.numPlayers
      );
      npcPlayerManager.markRemoveGroup(this.id);
      this.cleanup();
    }, this.duration);
  }

  /* Event skipTurnThreshold */
  _skipTurnThreshold(marketLoop: MarketLoop) {
    this.isActive++;
    console.log(
      "[Event] Start",
      this.isActive,
      this,
      this.marketLoopConfig.skipTurnThreshold
    );

    marketLoop.skipTurnThreshold = this.marketLoopConfig.skipTurnThreshold;

    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.isActive,
        this,
        marketLoop.defaultSkipTurnThreshold
      );
      marketLoop.skipTurnThreshold = marketLoop.defaultSkipTurnThreshold;
      this.cleanup();
    }, this.duration);
  }

  /* Event min/maxTurnDelay */
  _minMaxTurnDelay(marketLoop: MarketLoop) {
    this.isActive++;
    console.log(
      "[Event] Start",
      this.isActive,
      this,
      this.marketLoopConfig.minTurnDelay,
      this.marketLoopConfig.maxTurnDelay
    );
    marketLoop.stop();
    marketLoop.start(
      this.marketLoopConfig.minTurnDelay,
      this.marketLoopConfig.maxTurnDelay
    );

    setTimeout(() => {
      console.log(
        "[Event] Cleanup",
        this.isActive,
        marketLoop,
        marketLoop.defaultMinTurnDelay,
        marketLoop.defaultMaxTurnDelay
      );

      marketLoop.stop();
      marketLoop.start(
        marketLoop.defaultMinTurnDelay,
        marketLoop.defaultMaxTurnDelay
      );

      this.cleanup();
    }, this.duration);
  }

}

export default NewsEvent;
