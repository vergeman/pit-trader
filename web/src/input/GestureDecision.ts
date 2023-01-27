import { Gesture, GestureType, GestureAction } from "./Gesture";
import { NumberSM } from "./NumberSM";
import { ActionSM } from "./ActionSM";
import MatchingEngine from "../engine/MatchingEngine";
import { OrderType, Order } from "../engine/Order";

export default class GestureDecision {
  public me: MatchingEngine;

  private qtySM: NumberSM;
  private priceSM: NumberSM;
  private actionSM: ActionSM;
  private _qty: number | null;
  private _price: number | null;
  private _action: GestureAction;
  private timeout: number;

  constructor(me: MatchingEngine, timeout: number = 750) {
    this.me = me;
    this.qtySM = new NumberSM(GestureType.Qty, this.setQtyFn.bind(this), timeout);
    this.priceSM = new NumberSM(GestureType.Price, this.setPriceFn.bind(this), timeout);
    this.actionSM = new ActionSM(
      GestureType.Action,
      this.setActionFn.bind(this),
      timeout
    );

    this._qty = null;
    this._price = null;
    this._action = GestureAction.None;
    this.timeout = timeout;
  }

  get qty(): number | null {
    return this._qty;
  }
  get price(): number | null {
    return this._price;
  }
  get action(): GestureAction {
    return this._action;
  }

  setQtyFn(value: number) {
    console.log("[setQtyFn] FINAL", value);
    this._qty = value;
    this.triggerValidOrder();
  }

  setPriceFn(value: number) {
    //TODO: what is market value
    console.log("[setPriceFn] FINAL", value);
    this._price = value;
    this.triggerValidOrder();
  }

  setActionFn(action: GestureAction) {
    console.log("[setActionFn] FINAL", action);
    this._action = action;
    this.triggerValidOrder();
  }

  triggerValidOrder() {
    let order: Order | boolean = false;


    // console.log(
    //   `[GestureDecision] Check:`,
    //   `ACTION: ${this._action}, QTY: ${this._qty}, PRICE: ${this._price}`
    // );

    // CANCEL
    if (this._action === GestureAction.Cancel) {
      console.log("[GestureDecision] triggerValidOrder: Cancel");
      //TODO: send order cancel
      //how identify? player has order list
      this.reset();
      order = true;
    }

    // MARKET ORDER
    if (this._action === GestureAction.Market && this.qty !== null) {
      order = new Order("id-1", OrderType.Market, this.qty, NaN);
      try  {
        this.me.process(order);
        console.log("[GestureDecision] triggerValidOrder: Market order submitted", this.qty);
      } catch(e: any) {
        //TODO: notify user mechanic with message
        //1. store in matchingEngine, have it detect change in MtachingView
        //2. pass a function / setState
        console.error(e.message)
        this.reset();
      }
    } else if (this._action === GestureAction.Market && this.qty === null) {
      console.error("[GestureDecision] Market order submitted but missing qty", this.qty);
      this.reset();
    }

    // LIMIT ORDER
    if (this.price !== null && this.qty !== null) {
      order = new Order("id-1", OrderType.Limit, this.qty, this.price);
      try {
        this.me.process(order);
        console.log("[GestureDecision] triggerValidOrder Limit order submitted", {
          qty: this.qty,
          price: this.price,
        });
      } catch(e: any) {
        console.error(e.message)
        this.reset();
      }
    }

    if (order) {
      //TODO: add to some kind of player profile
      //or do we augment MatchingEngine - getOrders(player_id)
      this.reset();
    }
  }

  reset() {
    this._qty = null;
    this._price = null;
    this._action = GestureAction.None;

    this.qtySM.resetAll();
    this.priceSM.resetAll();
    this.actionSM.resetAll();
  }

  /*
   * Runner
   */
  calc(gesture: Gesture) {
    if (!gesture) return;

    //conditionals based on gesture and prior
    //console.log(gesture);

    this.actionSM.update(gesture);
    this.qtySM.update(gesture);
    this.priceSM.update(gesture);

    //post successful order submit we lock the SMs since tend to have "lingering" gesture
    //if we then get garbage, assume a "reset" and unlock for new gestures
    if (gesture.action === GestureAction.Garbage) {
      this.actionSM.unlock();
      this.qtySM.unlock();
      this.priceSM.unlock();
    }
  }
}
