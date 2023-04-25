import { Event, IEvent, EventType } from "./Event";
import { OrderType, Order } from "../engine/Order";
import { GestureDecision } from "../gesture/GestureDecision";
import { MarketLoop } from "./MarketLoop";

//corresponds to component visuals
export enum GestureDecisionEventState {
  None,
  Active, //initial screen
  NoMatch, //submit a miss
  Win, //matched event w/ order
  Lost, //expired
}

export interface IGestureDecisionEvent extends IEvent {
  img: string;
  bonus: number;
  gesture: {
    qty: number;
    price: number;
    orderType: OrderType;
  };
  gestureDecisionEventState: GestureDecisionEventState;
  dispatchHandler: (msg: any) => void;
  reset: () => void;
}

export class GestureDecisionEvent
  extends Event
  implements IGestureDecisionEvent
{
  private _img: string;
  private _bonus: number;
  private _gesture: {
    qty: number;
    price: number;
    orderType: OrderType;
  };
  private _gestureDecisionEventState: GestureDecisionEventState;
  dispatchHandler = (msg: any) => {};
  reset: () => void;

  constructor({
    id,
    type,
    msg,
    duration,
    marketLoop,
    gestureDecision,
    img,
    bonus,
    gesture,
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
    marketLoop: MarketLoop;
    gestureDecision: GestureDecision;
    img: string;
    bonus: number;
    gesture: IGestureDecisionEvent["gesture"];
  }) {
    super({ id, type, msg, duration, marketLoop, gestureDecision });
    this._img = img;
    this._bonus = bonus;
    this._gesture = gesture;
    this._gestureDecisionEventState = GestureDecisionEventState.None;
    this.dispatchHandler = () => {};
    this.reset = () => {};
  }

  get img(): string {
    return this._img;
  }
  get bonus(): number {
    return this._bonus;
  }
  get gesture(): IGestureDecisionEvent["gesture"] {
    return this._gesture;
  }
  get gestureDecisionEventState(): GestureDecisionEventState {
    return this._gestureDecisionEventState;
  }
  set gestureDecisionEventState(state: GestureDecisionEventState) {
    this._gestureDecisionEventState = state;
  }

  //this is callback on successful gesture
  //we need access to infoPanel context/reducer
  //props.gestureDecision.onEvent = (order, gestureDecision) => {
  onSubmitOrder(order: Order, gestureDecision: GestureDecision) {
    const state = this.gestureDecisionOrderMatch(order, gestureDecision);

    //state will be checked in boss reducer
    //NB: this is Message.NewsEvent to temp show on infopanel
    const msg = {
      type: EventType.GestureDecisionEvent,
      value: this.gestureDecisionEventState,
    };
    console.log(
      "[CameraGesture] EventManager Callback",
      state,
      msg,
      this.gestureDecisionEventState
    );

    this.dispatchHandler(msg);
  }

  begin() {
    //attach callback
    this.gestureDecision.onSubmitOrder = this.onSubmitOrder.bind(this);

    //this without bind/arrow function refers to gestureDecision
    //with arrow in CameraGesture, refers to EventManager
    console.log("[GestureDecisionEvent]", this, this.gestureDecision);
    this.isActive++;

    this.marketLoop.stop();
    console.log("[GestureDecisionEvent] stop");

    //TODO: stash current timeout intervals for use in setTimeout
    //(e.g. overwritten in generic marketLoop.start)
    this.gestureDecisionEventState = GestureDecisionEventState.Active;

    //const timeout = setTimeout(() => reset(), this.duration || 5000);
    const timeout = setTimeout(() => this.end(), this.duration || 5000);
    this.timeouts.push(timeout);
  }

  end() {
    console.log("[GestureDecisionEvent] End");

    if (this.gestureDecisionEventState !== GestureDecisionEventState.Win) {
      this.gestureDecisionEventState = GestureDecisionEventState.Lost;
    }

    //clear callbacks
    this.gestureDecision.onSubmitOrder = null;

    console.log(
      "[CameraGesture] EventonEnd gestureDecisionEventState",
      this.gestureDecisionEventState
    );
    const msg = {
      type: EventType.GestureDecisionEvent,
      value: this.gestureDecisionEventState,
    };

    this.dispatchHandler(msg);

    this.marketLoop.start();

    //on end, want a slight delay so user can see win/loss
    //here we allow marketloop and general execution to run
    //but events are disabled for a brie1f period
    setTimeout(() => {
      this.resetState();
      this.cleanup();

      console.log(
        "[CameraGesture] EventonEndTimeout gestureDecisionEventState",
        this.gestureDecisionEventState
      );

      const msg = {
        type: EventType.GestureDecisionEvent,
        value: this.gestureDecisionEventState, //should be None
      };

      this.dispatchHandler(msg);
    }, 3000);
  }

  resetState() {
    this.gestureDecisionEventState = GestureDecisionEventState.None;
  }

  gestureDecisionOrderMatch(order: Order, gestureDecision: GestureDecision) {
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

    console.log("[gestureDecisionOrderMatch] MATCHING", this.gesture, order);
    if (
      this.gesture.qty == order.qty &&
      this.gesture.price == order.gesturePrice &&
      this.gesture.orderType == order.orderType
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
      console.log("[gestureDecisionOrderMatch] event", this);

      //TODO: exit early
      this.clearTimeouts();
      this.end();
    }

    console.log(
      "[gestureDecisionOrderMatch] gestureDecisionEventState",
      this.gestureDecisionEventState
    );

    return this.gestureDecisionEventState;
  }
}

export default GestureDecisionEvent;
