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

  constructor(me: MatchingEngine) {
    this.me = me;
    this.qtySM = new NumberSM(GestureType.Qty, this.setQtyFn.bind(this));
    this.priceSM = new NumberSM(GestureType.Price, this.setPriceFn.bind(this));
    this.actionSM = new ActionSM(
      GestureType.Action,
      this.setActionFn.bind(this)
    );

    this._qty = null;
    this._price = null;
    this._action = GestureAction.None;
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

    console.log(
      `[GestureDecision] Check:`,
      `ACTION: ${this._action}, QTY: ${this._qty}, PRICE: ${this._price}`
    );

    if (this._action === GestureAction.Cancel) {
      console.log("[GestureDecision] triggerValidOrder: Cancel");
      //TODO: send order cancel
      //how identify? player has order list
      this.reset();
      order = true;
    }

    if (this._action === GestureAction.Market && this.qty !== null) {
      order = new Order("id-1", OrderType.Market, this.qty, NaN);
      this.me.process(order);
      console.log("[GestureDecision] triggerValidOrder: Market", this.qty);
    }

    if (this.price !== null && this.qty !== null) {
      order = new Order("id-1", OrderType.Limit, this.qty, this.price);
      this.me.process(order);
      console.log("[GestureDecision] triggerValidOrder order submitted", {
        qty: this.qty,
        price: this.price,
      });
    }

    if (order) {
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
    console.log(gesture);

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
