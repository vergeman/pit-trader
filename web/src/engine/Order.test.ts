import { OrderStatus, OrderType, Order } from "./Order";
import MatchingEngine from "./MatchingEngine";

describe("Order", () => {

  it("priceFilled() returns weighted avg price buys", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.Limit, 50, 100);
    const o2 = new Order("123", OrderType.Limit, 50, 50);
    const o3 = new Order("123", OrderType.Market, -100, 1);
    me.process(o1)
    me.process(o2)
    me.process(o3);

    expect(o3.priceFilled()).toEqual(75);
    expect(o2.priceFilled()).toEqual(50);
    expect(o1.priceFilled()).toEqual(100);
  })

  it("priceFilled() returns weighted avg price sells", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.Limit, -50, 100);
    const o2 = new Order("123", OrderType.Limit, -50, 50);
    const o3 = new Order("123", OrderType.Market, 100, Number.NaN);
    me.process(o1)
    me.process(o2)
    me.process(o3);

    expect(o3.priceFilled()).toEqual(75);
    expect(o2.priceFilled()).toEqual(50);
    expect(o1.priceFilled()).toEqual(100);
  })

  it("maintains accurate timestamps", async () => {
    const o1 = new Order("123", OrderType.Market, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const o2 = new Order("123", OrderType.Market, -50, 100);

    expect(o2.timestamp > o1.timestamp).toBeTruthy();
  });

  it("fill operates as an array of Order types", () => {
    const o1 = new Order("123", OrderType.Market, 50, 100);
    const o2 = new Order("123", OrderType.Market, -50, 100);
    o1.orderFills.push(o2);
    expect(o1.orderFills.length).toEqual(1);
  });

  it("creates an internal _id", () => {
    const o1 = new Order("123", OrderType.Market, 50, 100);
    expect(typeof o1.id == "string").toBeTruthy();
    expect(o1.id.length).toEqual(36);
  });

  it("cancelled() sets status to Cancelled", () => {
    const o1 = new Order("123", OrderType.Limit, 50, 100);
    o1.cancelled();
    expect(o1.status).toBe(OrderStatus.Cancelled);
  })
});
