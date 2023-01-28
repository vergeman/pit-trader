import { Gesture, GestureType, GestureAction } from "./Gesture";
import GestureDecision from "./GestureDecision";
import MatchingEngine from "../engine/MatchingEngine";

describe("GestureDecision", () => {
  const TIMEOUT = 50; //speed this up for tests. Typically 750 seems human-like.

  it("calc() gesture updates GestureType.Qty after Timeout via NumberSM", async () => {
    const me = new MatchingEngine();
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gesture = new Gesture(GestureType.Qty, GestureAction.Buy, 3);
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
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gesture = new Gesture(GestureType.Price, GestureAction.Sell, 2);
    gestureDecision.triggerValidOrder = jest.fn();
    gestureDecision.calc(gesture);

    expect(gestureDecision.price).toBe(null);
    expect(gestureDecision.triggerValidOrder).not.toHaveBeenCalled();
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(null);
    expect(gestureDecision.price).toBe(2);
    expect(gestureDecision.triggerValidOrder).toHaveBeenCalled();
  });

  it("calc() prepares a limit order", async () => {
    const me = new MatchingEngine();
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gestureQty = new Gesture(GestureType.Qty, GestureAction.Sell, -2);
    const gesturePrice = new Gesture(GestureType.Price, GestureAction.Sell, 8);

    expect(me.offers.size()).toBe(0);

    gestureDecision.calc(gestureQty);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(gestureDecision.qty).toBe(-2);

    gestureDecision.calc(gesturePrice);
    await new Promise((res) => setTimeout(res, TIMEOUT));
    expect(me.offers.size()).toBe(1);
    const offer = me.offers.peek();
    expect(offer && offer.qty).toBe(-2);
    expect(offer && offer.price).toBe(8);

  });

  it("calc() prepares a market order and transacts", async () => {
    const me = new MatchingEngine();
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2);
    const gesturePriceL = new Gesture(GestureType.Price, GestureAction.Buy, 2);
    const gestureQtyM = new Gesture(GestureType.Qty, GestureAction.Sell, -1);
    const gesturePriceM = new Gesture(
      GestureType.Price,
      GestureAction.Market,
      NaN
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
      new Gesture(GestureType.Action, GestureAction.Garbage, NaN)
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
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2);
    const gesturePriceL = new Gesture(GestureType.Price, GestureAction.Buy, 2);
    const gesturePriceM = new Gesture(
      GestureType.Price,
      GestureAction.Market,
      NaN
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
      new Gesture(GestureType.Action, GestureAction.Garbage, NaN)
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
    const gestureDecision = new GestureDecision(me, TIMEOUT);
    const gestureQtyL = new Gesture(GestureType.Qty, GestureAction.Buy, 2);
    const gestureCancel = new Gesture(
      GestureType.Action,
      GestureAction.Cancel,
      NaN
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

  it.todo("cancel removes working order from me");
});
