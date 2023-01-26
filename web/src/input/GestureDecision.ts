import { Gesture, GestureType, GestureAction } from "./Gesture";
import { NumberSM } from "./NumberSM";
import { ActionSM } from "./ActionSM";

export default class GestureDecision {
  public qtySM: NumberSM;
  public priceSM: NumberSM;
  public actionSM: ActionSM;
  private _qty: number | null;
  private _price: number | null;
  private _action: GestureAction;

  constructor() {
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
    let order = null;
    console.log(
      `[GestureDecision] Check:`,
      `ACTION: ${this._action}, QTY: ${this._qty}, PRICE: ${this._price}`
    );

    if (this._action === GestureAction.Cancel) {
      console.log("[GestureDecision] triggerValidOrder: Cancel");
      //TODO: send order cancel
      this.reset();
      order = true;
    }

    if (this._action === GestureAction.Market && this._qty !== null) {
      //TODO: build market order
      //order({qty: this._qty, price: null})
      console.log("[GestureDecision] triggerValidOrder: Market", this._qty);
      order = true;
    }

    if (this._price !== null && this._qty !== null) {
      //TODO: build limit order
      //order({qty: this._qty, price: this._price})
      console.log("[GestureDecision] triggerValidOrder order", {
        qty: this._qty,
        price: this._price,
      });
      order = true;
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
    //conditionals based on gesture and prior
    console.log(gesture);
    //console.log(gesture.type === GestureType.Price, gesture.action === GestureAction.Market);

    if (
      gesture.type === GestureType.Action ||
      (gesture.type === GestureType.Price &&
        gesture.action === GestureAction.Market)
    ) {
      this.actionSM.update(gesture);
    }

    if ([GestureType.Qty, GestureType.Price].includes(gesture.type)) {
      this.qtySM.update(gesture);
      this.priceSM.update(gesture);
    }
  }
}
