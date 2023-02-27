import { Gesture, GestureType, GestureAction } from "./Gesture";
import { NumberSM } from "./NumberSM";
import { ActionSM } from "./ActionSM";
import MatchingEngine from "../engine/MatchingEngine";
import MarketLoop from "../player/MarketLoop";
import Player from "../player/Player";
import { OrderType, Order } from "../engine/Order";

export interface GestureDecisionRecord {
  related_id: string;
  timestamp: number;
  action: GestureAction;
  qty: number | null;
  price: number | null;
}

export default class GestureDecision {
  public me: MatchingEngine;
  public marketLoop: MarketLoop;
  public player: Player;

  private qtySM: NumberSM;
  private priceSM: NumberSM;
  private actionSM: ActionSM;
  private _qty: number | null;
  private _price: number | null;
  private _action: GestureAction;
  private _records: GestureDecisionRecord[];

  constructor(
    me: MatchingEngine,
    marketLoop: MarketLoop,
    player: Player,
    timeout: number = 750
  ) {
    this.me = me;
    this.marketLoop = marketLoop;
    this.player = player;

    this.qtySM = new NumberSM(
      GestureType.Qty,
      this.setQtyFn.bind(this),
      timeout
    );
    this.priceSM = new NumberSM(
      GestureType.Price,
      this.setPriceFn.bind(this),
      timeout
    );
    this.actionSM = new ActionSM(
      GestureType.Action,
      this.setActionFn.bind(this),
      timeout
    );

    this._qty = null;
    this._price = null;
    this._action = GestureAction.None;
    this._records = [];
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
  get records(): GestureDecisionRecord[] {
    return this._records;
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

      if (this.player.orders.length) {
        order = this.player.orders.at(-1) as Order;
        //removes from ME queues, but keep in player orders list w/ status cancelled
        this.me.cancel(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: GestureAction.Cancel,
          qty: null,
          price: null,
        };

        this._records.unshift(record);
      }

      this.reset();
    }

    // MARKET ORDER
    if (this._action === GestureAction.Market && this.qty !== null) {
      order = new Order(this.player.id, OrderType.Market, this.qty, NaN);
      console.log("MARKET", order);
      try {
        this.me.process(order);
        this.player.addOrder(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: GestureAction.Market,
          qty: this.qty,
          price: null,
        };

        this._records.unshift(record);

        console.log(
          "[GestureDecision] triggerValidOrder: Market order submitted",
          this.qty
        );
      } catch (e: any) {
        //TODO: notify user mechanic with message
        //1. store in matchingEngine, have it detect change in MatchingView
        //2. pass a function / setState
        console.error(e.message);
        this.reset();
      }
    } else if (this._action === GestureAction.Market && this.qty === null) {
      console.log(
        "[GestureDecision] Market order submitted but missing qty",
        this.qty
      );
      this.reset();
    }

    // LIMIT ORDER
    if (this.price !== null && this.qty !== null) {
      const orderPrice = this.calcOrderPrice(this.qty, this.price);
      order = new Order(this.player.id, OrderType.Limit, this.qty, orderPrice);
      console.log("LIMIT", order);
      try {
        this.me.process(order);
        this.player.addOrder(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: this.qty > 0 ? GestureAction.Buy : GestureAction.Sell,
          qty: this.qty,
          price: orderPrice,
        };

        this._records.unshift(record);

        console.log(
          "[GestureDecision] triggerValidOrder Limit order submitted",
          order
        );
      } catch (e: any) {
        console.error(e.message);
        this.reset();
      }
    }

    if (order instanceof Order) {
      //TODO: add to some kind of player profile
      //or do we augment MatchingEngine - getOrders(player_id)
      this.reset();
    }
  }

  //attaches implied base price from gesture
  calcOrderPrice(qty: number, price: number): number {
    const bidOrder: Order = this.me.bids.peek();
    const offerOrder: Order = this.me.offers.peek();

    //if no bid or offer, returns priceSeed
    const marketPrice = this.marketLoop.getPrice();

    //base price
    const base = Number(marketPrice.toFixed(1).split("."));

    console.log("MP", marketPrice);
    return price;
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
