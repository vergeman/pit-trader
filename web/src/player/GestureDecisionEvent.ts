import { Event, IEvent, EventType } from "./Event";
import { OrderType, Order } from "../engine/Order";
import { GestureDecision } from "../gesture/GestureDecision";
import { MarketLoop } from "./MarketLoop";
import { GestureAction } from "../gesture/Gesture";

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
  action: GestureAction;
  gesture: {
    qty: number;
    price: number;
    orderType: OrderType;
  };
  gestureDecisionEventState: GestureDecisionEventState;
  state_msg: { [key: string]: string },
  dispatchHandler: (msg: any) => void;
}

export class GestureDecisionEvent
  extends Event
  implements IGestureDecisionEvent
{
  private _img: string;
  private _bonus: number;
  private _action: GestureAction;
  private _gesture: {
    qty: number;
    price: number;
    orderType: OrderType;
  };
  private _gestureDecisionEventState: GestureDecisionEventState;
  private _state_msg: { [key: string]: string };
  dispatchHandler = (msg: any) => {};

  constructor({
    id,
    type = EventType.GestureDecisionEvent,
    msg,
    duration,
    marketLoop,
    gestureDecision,
    img,
    bonus,
    action,
    gesture,
    state_msg = {}
  }: {
    id: string;
    type: EventType;
    msg: string;
    duration: number;
    marketLoop: MarketLoop;
    gestureDecision: GestureDecision;
    img: string;
    bonus: number;
    action: GestureAction;
    gesture: IGestureDecisionEvent["gesture"];
    state_msg: { [key: string]: string };
  }) {
    super({ id, type, msg, duration, marketLoop, gestureDecision });
    this._img = img;
    this._bonus = bonus;
    this._action = action;
    this._gesture = gesture;
    this._gestureDecisionEventState = GestureDecisionEventState.None;
    this._state_msg = state_msg;
    this.dispatchHandler = () => {};
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
  get action(): GestureAction {
    return this._action;
  }
  get gestureDecisionEventState(): GestureDecisionEventState {
    return this._gestureDecisionEventState;
  }
  set gestureDecisionEventState(state: GestureDecisionEventState) {
    this._gestureDecisionEventState = state;
  }
  get state_msg(): { [key: string]: string } {
    return this._state_msg;
  }
  //this is callback on successful gesture
  //we need access to infoPanel context/reducer
  onSubmitOrder(order: Order) {
    this.setGestureDecisionOrderMatch(order);

    //state will be checked in boss reducer
    //NB: this is Message.NewsEvent to temp show on infopanel
    const msg = {
      type: EventType.GestureDecisionEvent,
      value: this,
    };

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
      value: this,
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
        value: this,
      };

      this.dispatchHandler(msg);
    }, 3000);
  }

  resetState() {
    this.gestureDecisionEventState = GestureDecisionEventState.None;
  }

  setGestureDecisionOrderMatch(order: Order) {
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

    //gesture is the "challenge" defined in json. order is generated live by
    //user in /gesture/GestureDecision.ts. Here we compare the two for match.
    if (
      this.gesture.qty == order.qty &&
      this.gesture.price == order.gesturePrice &&
      this.gesture.orderType == order.orderType
    ) {
      this.gestureDecisionEventState = GestureDecisionEventState.Win;
    } else {
      this.gestureDecisionEventState = GestureDecisionEventState.NoMatch;
    }

    //MATCH
    if (this.gestureDecisionEventState == GestureDecisionEventState.Win) {
      //TODO: exit early
      this.clearTimeouts();
      this.end();
    }

    return this.gestureDecisionEventState;
  }
}

export default GestureDecisionEvent;
