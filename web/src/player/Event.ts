import { GestureAction } from "../gesture/Gesture";

export enum EventType {
  NewsEvent,
  GestureDecisionEvent,
}

export enum EventState {
  None,
  Active,
  Match,
  NoMatch,
}

export interface GestureDecisionEvent extends Event {
  img: string;
  bonus: number;
  gesture: {
    qty: number;
    price: number;
    action: GestureAction;
  };
}

export interface NewsEvent extends Event {
  delta: number;
  forceDirection: 1 | -1 | number | null;
  addPlayers: number;
  marketLoop: {
    minTurnDelay: number;
    maxTurnDelay: number;
    skipTurnThreshold: number;
  };
}

export interface Event {
  id: string;
  type: EventType;
  msg: string;
  duration: number; //ms
}

export default Event;
