import MatchingEngine from "./MatchingEngine";
import { OrderType, Order } from "./Order";

describe("maxComparator / minComparator", () => {
  it("ensure maxComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order("123", OrderType.Market, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Market, 50, 101);

    const o3 = new Order("123", OrderType.Market, 50, 100);
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

    const o1 = new Order("123", OrderType.Market, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Market, -50, 101);

    const o3 = new Order("123", OrderType.Market, -50, 100);
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
  })
});
