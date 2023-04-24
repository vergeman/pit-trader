import { IEvent, Event, EventType } from "./Event";

export interface INewsEvent extends IEvent {
  delta: number;
  forceDirection: 1 | -1 | number | null;
  addPlayers: number;
  marketLoop: {
    minTurnDelay: number;
    maxTurnDelay: number;
    skipTurnThreshold: number;
  };
}

export class NewsEvent extends Event implements INewsEvent {
  private _delta: number;
  private _forceDirection: 1 | -1 | number | null;
  private _addPlayers: number;
  private _marketLoop: {
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
    marketLoop,
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
    delta: number;
    forceDirection: INewsEvent["forceDirection"];
    addPlayers: number;
    marketLoop: INewsEvent["marketLoop"];
  }) {
    super({ id, type, msg, duration });
    this._delta = delta;
    this._forceDirection = forceDirection;
    this._addPlayers = addPlayers;
    this._marketLoop = marketLoop;
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
  get marketLoop(): INewsEvent["marketLoop"] {
    return this._marketLoop;
  }

  begin() {
    super.begin();
  }

  end() {
    super.end();
  }
}

export default NewsEvent;
