import MatchingEngine from "./MatchingEngine";
import { OrderStatus, OrderType, Order } from "./Order";


// TODO: cancel() operation
// TODO: effect on player - what happens post execute? what do we need

describe("process() basic operations", () => {

  it("adds a limit order to each empty queue", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 101);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(1);
  });

  it("limit orders execute against each other and are removed from queue", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 100); //note: price
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(0);
    expect(me.offers.size()).toEqual(0);
  });

  it("heap behavior for queues - self orders so Orders execute at best price", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, -50, 103);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 102);
    //pay 103 will lift the 102 offer
    const o3 = new Order("Player 2", OrderType.Limit, 50, 103);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);
    expect(me.offers.size()).toEqual(1);
    expect(me.offers.peek()).toBe(o1);
  });

  it("market order submitted to empty queues are rejected", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Market, 50, 100);
    expect(() => me.process(o1)).toThrow("rejected");
    expect(o1.status).toBe(OrderStatus.Rejected);
  });

  it("market order on larger qty limit order: market order filled, partial fill on limit", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 500, 100);
    const o2 = new Order("Player 2", OrderType.Market, -50, -1);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(450);
  });

  it("limit order on larger qty limit order: limit order filled, partial fill on existing order", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 500, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 100);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(450);
  });

});

describe("process() orders fill on multiple orders", () => {
  it("market order on smaller qty limit order - sweeps multiple orders", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Market, -75, -1);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);
    expect(o1.status).toBe(OrderStatus.Complete);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(25);
    expect(bid && bid.price).toEqual(99);
    expect(bid && bid.status).toBe(OrderStatus.Live);
  });

  it("limit order sweep - remainder becomes working limit order", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Limit, -175, 97);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);

    //fills
    expect(o1.qtyFilled).toEqual(50);
    expect(o2.qtyFilled).toEqual(50);
    expect(o1.status).toBe(OrderStatus.Complete);
    expect(o2.status).toBe(OrderStatus.Complete);

    //remainder
    expect(me.offers.size()).toEqual(1);
    const offer = me.offers.peek();
    expect(offer).toBe(o3);
    expect(offer && offer.qty).toEqual(-75);
    expect(offer && offer.price).toEqual(97);
    expect(offer && offer.status).toBe(OrderStatus.Live);
  });

  //TODO: unsure policy depending on game dynamcis
  it("market order sweep with remainder - no more markets leaves partial fill but is marked as complete", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Market, -175, 97);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);

    //fills
    expect(o1.qtyFilled).toEqual(50);
    expect(o2.qtyFilled).toEqual(50);

    //remainder for market order isn't worked
    expect(me.offers.size()).toEqual(0);
    expect(o1.status).toBe(OrderStatus.Complete);
    expect(o2.status).toBe(OrderStatus.Complete);
    expect(o3.status).toBe(OrderStatus.Complete);
  });
});

describe("maxComparator / minComparator", () => {
  it("ensure maxComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order("123", OrderType.Limit, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Limit, 50, 101);

    const o3 = new Order("123", OrderType.Limit, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addBid(o1);
    me.addBid(o2);
    me.addBid(o3);

    expect(me.bids.peek()).toBe(o2);
    me.bids.poll();
    expect(me.bids.peek()).toBe(o1);
    me.bids.poll();
    expect(me.bids.peek()).toBe(o3);
  });

  it("ensure minComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order("123", OrderType.Limit, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Limit, -50, 101);

    const o3 = new Order("123", OrderType.Limit, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addOffer(o1);
    me.addOffer(o2);
    me.addOffer(o3);

    expect(me.offers.peek()).toBe(o1);
    me.offers.poll();
    expect(me.offers.peek()).toBe(o3);
    me.offers.poll();
    expect(me.offers.peek()).toBe(o2);
  });

  it("supports removal of element from queue if needed (e.g. canceled)", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.Market, -50, 100);
    const o2 = new Order("123", OrderType.Market, -50, 101);
    const o3 = new Order("123", OrderType.Market, -50, 102);

    me.addOffer(o1);
    me.addOffer(o2);
    me.addOffer(o3);

    me.offers.remove(o2);

    expect(me.offers.contains(o1)).toBeTruthy();
    expect(me.offers.contains(o2)).toBeFalsy();
    expect(me.offers.contains(o3)).toBeTruthy();
  });
});
