import { Event, IEvent, EventType } from "./Event";
import { OrderType, Order } from "../exchange/Order";
import { GestureDecision } from "../gesture/GestureDecision";
import { MarketLoop } from "../exchange/MarketLoop";
import { GestureAction } from "../gesture/Gesture";
import Player from "../player/Player";

//corresponds to component visuals
export enum GestureDecisionEventState {
  NONE,
  ACTIVE, //initial screen
  NOMATCH, //submit a miss
  WIN, //ematched event w/ order
  LOST, //expired
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
  state_msg: { [key: string]: string };
  dispatchHandler: (msg: any, tabName?: string) => void;
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
  dispatchHandler = (msg: any, tabName?: string) => {};

  constructor({
    id,
    type = EventType.GESTUREDECISION,
    msg,
    duration,
    marketLoop,
    gestureDecision,
    img,
    bonus,
    action,
    gesture,
    state_msg = {},
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
    this._gestureDecisionEventState = GestureDecisionEventState.NONE;
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
  setDispatchHandler(fn: (msg: any, tabName?: string) => {}) {
    this.dispatchHandler = fn;
  }
  //this is callback on successful gesture
  //we need access to infoPanel context/reducer
  onSubmitOrder(player: Player, order: Order) {
    this.setGestureDecisionOrderMatch(player, order);

    //state will be checked in boss reducer
    //NB: this is Message.NewsEvent to temp show on infopanel
    const msg = {
      type: EventType.GESTUREDECISION,
      value: this,
    };

    this.dispatchHandler(msg);
  }

  begin() {
    //attach callback
    this.gestureDecision.onSubmitOrder = this.onSubmitOrder.bind(this);
    this.gestureDecision.enableMessages = false;
    //this without bind/arrow function refers to gestureDecision
    //with arrow in CameraGesture, refers to EventManager
    console.log("[GestureDecisionEvent]", this, this.gestureDecision, this.gestureDecision.enableMessages);
    this.isActive++;

    this.marketLoop.stop();
    console.log("[GestureDecisionEvent] stop");

    //TODO: stash current timeout intervals for use in setTimeout
    //(e.g. overwritten in generic marketLoop.start)
    this.gestureDecision.reset();
    this.gestureDecisionEventState = GestureDecisionEventState.ACTIVE;

    const timeout = setTimeout(() => this.end(), this.duration || 5000);
    this.timeouts.push(timeout);
  }

  end() {
    console.log("[GestureDecisionEvent] End");

    if (this.gestureDecisionEventState !== GestureDecisionEventState.WIN) {
      this.gestureDecisionEventState = GestureDecisionEventState.LOST;
    }

    //clear callbacks
    this.gestureDecision.onSubmitOrder = null;

    console.log(
      "[CameraGesture] EventonEnd gestureDecisionEventState",
      this.gestureDecisionEventState
    );
    const msg = {
      type: EventType.GESTUREDECISION,
      value: this,
    };

    this.dispatchHandler(msg);

    this.marketLoop.start();

    //on end, want a slight delay so user can see win/loss
    //here we allow marketloop and general execution to run
    //but events are disabled for a brie1f period
    const endDelayTimeout = setTimeout(() => {
      this.resetState();
      this.cleanup();
      this.gestureDecision.reset();
      this.gestureDecision.enableMessages = true;

      console.log(
        "[CameraGesture] EventonEndTimeout gestureDecisionEventState",
        this.gestureDecisionEventState
      );

      const msg = {
        type: EventType.GESTUREDECISION,
        value: this,
      };

      this.dispatchHandler(msg, "messages");
    }, 3000);

    this.timeouts.push(endDelayTimeout);
  }

  resetState() {
    this.gestureDecisionEventState = GestureDecisionEventState.NONE;
  }

  setGestureDecisionOrderMatch(player: Player, order: Order) {
    /*
     * Match
     */
    //if none, win, lost - event doesn't exist or is over, so no gesture comparison
    //if active/nomatch it's ongoing
    //make sure once a state changes we lock
    if (
      ![
        GestureDecisionEventState.ACTIVE,
        GestureDecisionEventState.NOMATCH,
      ].includes(this.gestureDecisionEventState)
    )
      return this.gestureDecisionEventState;

    //gesture is the "challenge" defined in json. order is generated live by
    //user in /gesture/GestureDecision.ts. Here we compare the two for match.
    if (
      this.gesture.qty === order.qty &&
      this.gesture.price === order.gesturePrice &&
      this.gesture.orderType === order.orderType
    ) {
      this.gestureDecisionEventState = GestureDecisionEventState.WIN;
    } else {
      this.gestureDecisionEventState = GestureDecisionEventState.NOMATCH;
    }

    //MATCH
    if (this.gestureDecisionEventState === GestureDecisionEventState.WIN) {
      //TODO: exit early
      player.addBonus(this.bonus);
      this.clearTimeouts();
      this.end();
    }

    return this.gestureDecisionEventState;
  }
}

export default GestureDecisionEvent;