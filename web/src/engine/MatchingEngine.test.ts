import MatchingEngine from "./MatchingEngine";
import { OrderType, Order } from "./Order";

describe("maxComparator / minComparator", () => {
  it("ensure maxComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order(OrderType.Market, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order(OrderType.Market, 50, 101);

    const o3 = new Order(OrderType.Market, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addBid(o1);
    me.addBid(o2);
    me.addBid(o3);

    expect(me.bids.front()).toBe(o2);
    me.bids.dequeue();
    expect(me.bids.front()).toBe(o1);
    me.bids.dequeue();
    expect(me.bids.front()).toBe(o3);
  });

  it("ensure minComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order(OrderType.Market, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order(OrderType.Market, -50, 101);

    const o3 = new Order(OrderType.Market, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addOffer(o1);
    me.addOffer(o2);
    me.addOffer(o3);

    expect(me.offers.front()).toBe(o1);
    me.offers.dequeue();
    expect(me.offers.front()).toBe(o3);
    me.offers.dequeue();
    expect(me.offers.front()).toBe(o2);
  });
});
