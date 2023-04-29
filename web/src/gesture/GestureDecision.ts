import { Gesture, GestureType, GestureAction } from "./Gesture";
import { NumberSM } from "./NumberSM";
import { ActionSM } from "./ActionSM";
import MatchingEngine from "../engine/MatchingEngine";
import MarketLoop from "../player/MarketLoop";
import Player from "../player/Player";
import { OrderType, OrderStatus, Order } from "../engine/Order";
import Message from "../infopanel/Message.js";
import RiskManager from "../player/RiskManager";

export enum RenderState {
  GESTURE_DECISION, //vanilla gesture decision (partial order build)
  GESTURE_DECISION_RECORD, //submitted order - delay
  GESTURE_CANCEL, //cancel as gesture - delay
}

export interface GestureDecisionRecord {
  related_id: string;
  timestamp: number;
  action: GestureAction;
  qty: number | null;
  price: number | null;
  gesturePrice: number | null;
}

export class GestureDecision {
  public me: MatchingEngine;
  public marketLoop: MarketLoop;
  public player: Player;
  public riskManager: RiskManager;

  private qtySM: NumberSM;
  private priceSM: NumberSM;
  private actionSM: ActionSM;
  private _qty: number | null;
  private _price: number | null;
  private _action: GestureAction;
  private _records: GestureDecisionRecord[];
  private _renderState: RenderState;
  private _renderStateTimeout: number;
  private _enableMessages: boolean;
  private _messages: any[];
  private _onSubmitOrder: null | ((player: Player, order: Order) => void);
  private _enable: boolean; //toggle gesture recognition on/off - lock game on loss

  constructor(
    me: MatchingEngine,
    marketLoop: MarketLoop,
    player: Player,
    riskManager: RiskManager,
    timeout: number = 750,
    renderStateTimeout: number = 1000
  ) {
    this.me = me;
    this.marketLoop = marketLoop;
    this.player = player;
    this.riskManager = riskManager;

    this.qtySM = new NumberSM(
      GestureType.QTY,
      this.setQtyFn.bind(this),
      timeout
    );
    this.priceSM = new NumberSM(
      GestureType.PRICE,
      this.setPriceFn.bind(this),
      timeout
    );
    this.actionSM = new ActionSM(
      GestureType.ACTION,
      this.setActionFn.bind(this),
      timeout
    );

    this._qty = null;
    this._price = null;
    this._action = GestureAction.NONE;
    this._records = [];
    this._renderState = RenderState.GESTURE_DECISION;
    this._renderStateTimeout = renderStateTimeout;
    this._enableMessages = true;
    this._messages = [];
    this._onSubmitOrder = null;
    this._enable = true;
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
  set records(records: GestureDecisionRecord[]) {
    this._records = records;
  }
  get renderState(): RenderState {
    return this._renderState;
  }
  get renderStateTimeout(): number {
    return this._renderStateTimeout;
  }
  get enableMessages(): boolean {
    return this._enableMessages;
  }
  set enableMessages(enable: boolean) {
    this._enableMessages = enable;
  }
  get messages(): any[] {
    return this._messages;
  }
  get onSubmitOrder(): null | ((player: Player, order: Order) => void) {
    return this._onSubmitOrder;
  }
  set onSubmitOrder(fn: null | ((player: Player, order: Order) => void)) {
    this._onSubmitOrder = fn;
  }
  get enable(): boolean {
    return this._enable;
  }
  set enable(e: boolean) {
    this._enable = e;
  }
  resetMessages(): void {
    this._messages = [];
  }

  setQtyFn(value: number) {
    console.log("[setQtyFn] FINAL", value);
    this._qty = value;
    this.addMessage(Message.SetQty, this._qty);
    this.triggerValidOrder();
  }

  setPriceFn(value: number) {
    console.log("[setPriceFn] FINAL", value);
    this._price = value;
    this.addMessage(Message.SetPrice, this._price);
    this.triggerValidOrder();
  }

  setActionFn(action: GestureAction) {
    console.log("[setActionFn] FINAL", action);
    this._action = action;
    this.triggerValidOrder();
  }

  submitOrder(order: Order) {
    console.log("[GestureDecision] submitOrder");

    if (this.onSubmitOrder) {
      this.onSubmitOrder(this.player, order);
      return;
    }

    const positionLimits = this.riskManager.exceedsLimit(
      this.player,
      this.riskManager.positionLimit,
      [order]
    );
    const maxOrderLimits = this.riskManager.exceedsMaxOrder(
      this.player,
      this.riskManager.maxOrderLimit,
      [order]
    );

    //Position Limit Exceed: [Current: 8, Working: 12]
    if (positionLimits.exceedsLimit) {
      const errMsg = `Position Limit Restriction: \
[Current: ${positionLimits.open}, Working: ${positionLimits.working}]. \
Order exceeds limit of ${this.riskManager.positionLimit}`;
      throw new Error(errMsg, { cause: positionLimits });
    }

    if (maxOrderLimits.exceedsMaxOrder) {
      const errMsg = `Order Limit Restriction: \
[Working: ${maxOrderLimits.working}, Submitted: ${maxOrderLimits.orders}]. \
Order exceeds limit of ${this.riskManager.maxOrderLimit}`;
      throw new Error(errMsg, { cause: positionLimits });
    }

    this.me.process(order);
    this.player.addOrder(order);
  }

  handleError(e: Error) {
    console.error(e.message, e.cause);
    this.addMessage(Message.ErrorSubmitOrder, e);
    this.reset();
  }

  //NB: distinction between gesturePrice (this.price) and orderPrice (base price + gesturePrice / 10)
  //used with order values
  triggerValidOrder() {
    let order: Order | boolean = false;

    console.log(
      `[GestureDecision] Check:`,
      `ACTION: ${this._action}, QTY: ${this._qty}, PRICE: ${this._price}`
    );

    // CANCEL
    if (this._action === GestureAction.CANCEL) {
      console.log("[GestureDecision] triggerValidOrder: Cancel");

      const liveOrders = this.player.orders.filter(
        (order) => order.status === OrderStatus.LIVE
      );

      if (liveOrders.length) {
        order = liveOrders.at(-1) as Order;
        //removes from ME queues, but keep in player orders list w/ status cancelled
        this.me.cancel(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: GestureAction.CANCEL,
          qty: null,
          price: null,
          gesturePrice: null,
        };

        this._records.unshift(record);

        this.addMessage(Message.CancelOrder, order);
      } else {
        //if no orders just reset gesture
        this.addMessage(Message.CancelGesture, null);
      }

      this.triggerRenderStateTimer(
        RenderState.GESTURE_CANCEL,
        this.renderStateTimeout
      );
      this.reset();
    }

    // MARKET ORDER
    if (this._action === GestureAction.MARKET && this.qty !== null) {
      order = new Order(
        this.player.id,
        OrderType.MARKET,
        this.qty,
        NaN,
        NaN,
        this.player.isLive
      );
      console.log("MARKET", order);
      try {
        this.submitOrder(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: GestureAction.MARKET,
          qty: this.qty,
          price: null,
          gesturePrice: null,
        };

        this._records.unshift(record);

        console.log(
          "[GestureDecision] triggerValidOrder: Market order submitted",
          this.qty
        );

        this.addMessage(Message.OrderSubmitted, order);
      } catch (e: any) {
        this.handleError(e);
      }

      this.reset();
    } else if (this._action === GestureAction.MARKET && this.qty === null) {
      console.log(
        "[GestureDecision] Market order submitted but missing qty",
        this.qty
      );
      this.reset();
    }

    // LIMIT ORDER
    if (this.price !== null && this.qty !== null) {
      const orderPrice = this.calcOrderPrice(this.qty, this.price);
      order = new Order(
        this.player.id,
        OrderType.LIMIT,
        this.qty,
        orderPrice,
        this.price,
        this.player.isLive
      );
      console.log("LIMIT", order);
      try {
        this.submitOrder(order);

        const record: GestureDecisionRecord = {
          related_id: order.id,
          timestamp: Date.now(),
          action: this.qty > 0 ? GestureAction.BUY : GestureAction.SELL,
          qty: this.qty,
          price: orderPrice,
          gesturePrice: this.price,
        };

        this._records.unshift(record);

        console.log(
          "[GestureDecision] triggerValidOrder Limit order submitted",
          order
        );

        this.addMessage(Message.OrderSubmitted, order);
      } catch (e: any) {
        this.handleError(e);
      }
    }

    // successful order was created
    if (order instanceof Order) {
      //reset GestureDecision, but set flag for display purposes
      //need to indicate to user
      this.triggerRenderStateTimer(
        RenderState.GESTURE_DECISION_RECORD,
        this.renderStateTimeout
      );
      this.reset();
    }
  }

  getNewMessages() {
    const transactionMsgs: any = [];
    for (let order of this.player.orders) {
      for (let transaction of order.getNewTransactions()) {
        const type =
          order.orderType == OrderType.LIMIT
            ? Message.FillLimit
            : Message.FillMarket;
        transactionMsgs.push({
          type,
          value: { order, transaction },
        });

        if (transaction.status == OrderStatus.COMPLETE) {
          transactionMsgs.push({
            type: Message.OrderFilled,
            value: order,
          });
        }
      }
    }

    return ([] as any).concat(this.messages, transactionMsgs);
  }

  addMessage(type: String, value: any) {
    console.log("[addMessage]", type, value, this.enableMessages);
    if (!this.enableMessages) return;
    this._messages.push({ type, value });
  }

  triggerRenderStateTimer(renderState: RenderState, time: number): void {
    this._renderState = renderState;
    setTimeout(() => {
      this._renderState = RenderState.GESTURE_DECISION;
    }, time);
  }

  //attaches implied base price from gesture
  calcOrderPrice(qty: number, gesturePrice: number): number {
    //if no bid or offer, returns priceSeed
    const marketPrice = this.marketLoop.getPrice();
    //base price
    const base = Number(marketPrice.toFixed(1).split(".").at(0));

    //decide price using handles b-1, b, b+1
    const distances = [
      base + gesturePrice / 10 - 1,
      base + gesturePrice / 10,
      base + gesturePrice / 10 + 1,
    ];

    const price = this.minDistancePrice(distances, qty, marketPrice);
    //console.log(marketPrice, base, distances, price);

    return price;
  }

  minDistancePrice(nums: number[], qty: number, marketPrice: number): number {
    if (nums.length <= 0) return NaN;

    let min = Math.abs(nums[0] - marketPrice);
    let minPos = 0;

    for (let i = 0; i < nums.length; i++) {
      const distance = Math.abs(nums[i] - marketPrice);
      if (distance < min) {
        min = Math.abs(nums[i] - marketPrice);
        minPos = i;
      }

      //since we're looping low to high (b-1,b,b+1)
      //if equidistant and it's an offer - select the higher base
      if (distance === min) {
        if (qty < 0) minPos = i;
      }
    }
    return nums[minPos];
  }

  reset() {
    this.enable = true;
    this._qty = null;
    this._price = null;
    this._action = GestureAction.NONE;

    this.qtySM.resetAll();
    this.priceSM.resetAll();
    this.actionSM.resetAll();
  }

  resetRecords() {
    this.reset();
    this.records = [];
  }
  /*
   * Runner
   */
  calc(gesture: Gesture) {
    if (!gesture) return;
    if (!this.enable) return;
    //conditionals based on gesture and prior
    //console.log(gesture);

    this.actionSM.update(gesture);
    this.qtySM.update(gesture);
    this.priceSM.update(gesture);

    //post successful order submit we lock the SMs since tend to have "lingering" gesture
    //if we then get garbage, assume a "reset" and unlock for new gestures
    if (gesture.action === GestureAction.GARBAGE) {
      this.actionSM.unlock();
      this.qtySM.unlock();
      this.priceSM.unlock();
    }
  }
}

export default GestureDecision;
