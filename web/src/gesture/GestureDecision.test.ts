import { Gesture, GestureType, GestureAction } from "./Gesture";
import { OrderStatus } from "../engine/Order";
import GestureDecision from "./GestureDecision";
import MatchingEngine from "../engine/MatchingEngine";
import Player from "../player/Player";
import NPCPlayerManager from "../player/NPCPlayerManager";
import MarketLoop from "../player/MarketLoop";
import RiskManager from "../player/RiskManager";

const TIMEOUT = 50; //speed this up for tests. Typically 750 seems human-like.

describe("GestureDecision", () => {
  it("calc() gesture updates GestureType.Qty after Timeout via NumberSM", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({ npcPlayerManager, priceSeed: 100, qtySeed: 10 });
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gesture = new Gesture(GestureType.Qty, GestureAction.Buy, 3, 1);
    gestureDecision.triggerValidOrder = jest.fn();
    gestureDecision.calc(gesture);

    expect(gestureDecision.qty).toBe(null);
    expect(gestureDecision.triggerValidOrder).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.price).toBe(null);
    expect(gestureDecision.qty).toBe(3);
    expect(gestureDecision.triggerValidOrder).toHaveBeenCalled();
  });

  it("calc() gesture updates GestureType.Price after Timeout via NumberSM", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gesture = new Gesture(GestureType.Price, GestureAction.Sell, 2, 1);
    gestureDecision.triggerValidOrder = jest.fn();
    gestureDecision.calc(gesture);

    expect(gestureDecision.price).toBe(null);
    expect(gestureDecision.triggerValidOrder).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(null);
    expect(gestureDecision.price).toBe(2);
    expect(gestureDecision.triggerValidOrder).toHaveBeenCalled();
  });

  // noinspection JSUnusedLocalSymbols
  it("calc() prepares a limit order", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    marketLoop.getPrice = jest.fn(() => 100);
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gestureQty = new Gesture(GestureType.Qty, GestureAction.Sell, -2, 1);
    const gesturePrice = new Gesture(GestureType.Price, GestureAction.Sell, 8, 1);

    expect(me.offers.size()).toBe(0);

    gestureDecision.calc(gestureQty);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(-2);

    gestureDecision.calc(gesturePrice);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(me.offers.size()).toBe(1);
    const offer = me.offers.peek();
    expect(offer && offer.qty).toBe(-2);
    expect(offer && offer.price).toBe(99.8);
  });

  it("calc() prepares a market order and transacts", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2, 1);
    const gesturePriceL = new Gesture(GestureType.Price, GestureAction.Buy, 2, 1);
    const gestureQtyM = new Gesture(GestureType.Qty, GestureAction.Sell, -1, 1);
    const gesturePriceM = new Gesture(
      GestureType.Price,
      GestureAction.Market,
      NaN,
      null
    );

    //build limit
    gestureDecision.calc(gestureQtyL);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(2);
    gestureDecision.calc(gesturePriceL);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    let bid = me.bids.peek();
    expect(me.bids.size()).toBe(1);
    expect(bid && bid.qty).toBe(2);

    //market

    //garbage to unlock
    gestureDecision.calc(
      new Gesture(GestureType.Action, GestureAction.Garbage, NaN, null)
    );
    gestureDecision.calc(gestureQtyM);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    gestureDecision.calc(gesturePriceM);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    bid = me.bids.peek();
    expect(me.bids.size()).toBe(1);
    expect(bid && bid.qty).toBe(1);
  });

  //market with no quantity
  it("calc(): market order missing quantity is rejected - no change", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2, 1);
    const gesturePriceL = new Gesture(GestureType.Price, GestureAction.Buy, 2, 1);
    const gesturePriceM = new Gesture(
      GestureType.Price,
      GestureAction.Market,
      NaN,
      null
    );

    //build limit
    gestureDecision.calc(gestureQtyL);
    gestureDecision.calc(gesturePriceL);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    let bid = me.bids.peek();
    expect(me.bids.size()).toBe(1);
    expect(bid && bid.qty).toBe(2);

    //no change
    gestureDecision.calc(
      new Gesture(GestureType.Action, GestureAction.Garbage, NaN, null)
    );
    gestureDecision.calc(gesturePriceM);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    bid = me.bids.peek();
    expect(me.bids.size()).toBe(1);
    expect(bid && bid.qty).toBe(2);
  });

  //test cancel order
  it("calc() cancel order resets gestureDecision", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2, 1);
    const gestureCancel = new Gesture(
      GestureType.Action,
      GestureAction.Cancel,
      NaN,
      null
    );

    //build limit
    gestureDecision.calc(gestureQtyL);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(2);

    gestureDecision.calc(gestureCancel);
    await new Promise((res) => setTimeout(res, TIMEOUT));

    expect(gestureDecision.qty).toBe(null);
    expect(gestureDecision.price).toBe(null);
  });

  it("cancel removes working order from me, set order status to cancelled", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});

    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2, 1);
    const gesturePriceL = new Gesture(GestureType.Price, GestureAction.Buy, 2, 1);
    const gestureCancel = new Gesture(
      GestureType.Action,
      GestureAction.Cancel,
      NaN,
      null
    );

    //build limit
    gestureDecision.calc(gestureQtyL);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(2);

    gestureDecision.calc(gesturePriceL);
    await new Promise((res) => setTimeout(res, TIMEOUT));

    //order submit
    const order = me.bids.peek();
    expect(me.bids.length).toBe(1);
    expect(p.orders.length).toBe(1);
    expect(order && order.status).toBe(OrderStatus.Live);

    gestureDecision.calc(gestureCancel);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(me.bids.length).toBe(0); //removed from queue
    expect(p.orders.length).toBe(1); //maintained in player queue
    expect(order && order.status).toBe(OrderStatus.Cancelled);
  });
});

describe("GestureDecision calcOrderPrice scenarios", () => {
  it("minDistancePrice", () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});
    const gd = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    expect(gd.minDistancePrice([99, 100, 101], 1, 100)).toBe(100);
    expect(gd.minDistancePrice([], 1, 10)).toBe(NaN);
    expect(gd.minDistancePrice([0, 1, 2, -1], 1, 3)).toBe(2);
  });

  it("calcOrderPrice attaches an implied base price with the gesture value when creating an Order", async () => {
    const me = new MatchingEngine();
    const npcPlayerManager = new NPCPlayerManager(me, []);
    const marketLoop = new MarketLoop({npcPlayerManager, priceSeed: 100, qtySeed: 10});
    const p = new Player("test");
    const riskManager = new RiskManager({});
    const gestureDecision = new GestureDecision(me, marketLoop, p, riskManager, TIMEOUT);
    marketLoop.getPrice = jest.fn(() => 100.8); //distance 100.8

    expect(gestureDecision.calcOrderPrice(1, 0)).toBe(101); //.8 | .2
    expect(gestureDecision.calcOrderPrice(-1, 0)).toBe(101);
    expect(gestureDecision.calcOrderPrice(1, 1)).toBe(101.1); //.7 | .3
    expect(gestureDecision.calcOrderPrice(-1, 1)).toBe(101.1);
    expect(gestureDecision.calcOrderPrice(1, 2)).toBe(101.2); //.6 | .4
    expect(gestureDecision.calcOrderPrice(-1, 2)).toBe(101.2);
    //NB: price depends on qty
    expect(gestureDecision.calcOrderPrice(1, 3)).toBe(100.3); //.5 | .5
    expect(gestureDecision.calcOrderPrice(-1, 3)).toBe(101.3);

    expect(gestureDecision.calcOrderPrice(1, 4)).toBe(100.4); //.4 | .6
    expect(gestureDecision.calcOrderPrice(-1, 4)).toBe(100.4);
    expect(gestureDecision.calcOrderPrice(1, 5)).toBe(100.5); //.3 | .7
    expect(gestureDecision.calcOrderPrice(-1, 5)).toBe(100.5);
    expect(gestureDecision.calcOrderPrice(1, 6)).toBe(100.6); //.2 | .8
    expect(gestureDecision.calcOrderPrice(-1, 6)).toBe(100.6);
    expect(gestureDecision.calcOrderPrice(1, 7)).toBe(100.7); //.1 | .9
    expect(gestureDecision.calcOrderPrice(-1, 7)).toBe(100.7);
    expect(gestureDecision.calcOrderPrice(1, 8)).toBe(100.8); //.0 | .0
    expect(gestureDecision.calcOrderPrice(-1, 8)).toBe(100.8);
    expect(gestureDecision.calcOrderPrice(1, 9)).toBe(100.9); //.1 | .1
    expect(gestureDecision.calcOrderPrice(-1, 9)).toBe(100.9);
  });
});
