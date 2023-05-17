import { OrderStatus, OrderType, Order } from "./Order";
import MatchingEngine from "./MatchingEngine";

describe("Order", () => {
  it("priceFilled() returns weighted avg price buys", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.LIMIT, 50, 100);
    const o2 = new Order("123", OrderType.LIMIT, 50, 50);
    const o3 = new Order("123", OrderType.MARKET, -100, 1);
    me.process(o1);
    me.process(o2);
    me.process(o3);

    expect(o3.priceFilled()).toEqual(75);
    expect(o2.priceFilled()).toEqual(50);
    expect(o1.priceFilled()).toEqual(100);
  });

  it("priceFilled() returns weighted avg price sells", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.LIMIT, -50, 100);
    const o2 = new Order("123", OrderType.LIMIT, -50, 50);
    const o3 = new Order("123", OrderType.MARKET, 100, Number.NaN);
    me.process(o1);
    me.process(o2);
    me.process(o3);

    expect(o3.priceFilled()).toEqual(75);
    expect(o2.priceFilled()).toEqual(50);
    expect(o1.priceFilled()).toEqual(100);
  });

  it("maintains accurate timestamps", async () => {
    const o1 = new Order("123", OrderType.MARKET, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const o2 = new Order("123", OrderType.MARKET, -50, 100);

    expect(o2.timestamp > o1.timestamp).toBeTruthy();
  });

  it("creates an internal _id", () => {
    const o1 = new Order("123", OrderType.MARKET, 50, 100);
    expect(typeof o1.id == "string").toBeTruthy();
    expect(o1.id.length).toEqual(36);
  });

  it('ensures prices and qty are not endless floats', () => {
    const o1 = new Order("123", OrderType.LIMIT, 50, 100.1 + 100.3);
    expect(o1.qty).toBe(50);
    expect(o1.price).toBe(200.4);
    const o2 = new Order("123", OrderType.LIMIT, 50.1 + 50.2, 100);
    expect(o2.qty).toBe(100.3);
    expect(o2.price).toBe(100);
  });

  it("cancelled() sets status to Cancelled", () => {
    const o1 = new Order("123", OrderType.LIMIT, 50, 100);
    o1.cancelled();
    expect(o1.status).toBe(OrderStatus.CANCELLED);
  });

  it("execute() returns a TransactionReport", async () => {
    const tstamp = Date.now();
    await new Promise((res) => setTimeout(res, 10));
    const o1 = new Order("123", OrderType.LIMIT, -50, 50);
    const o2 = new Order("abc", OrderType.MARKET, 25, NaN);
    const transactionReport = o2.execute(o1);
    expect(transactionReport.price).toBe(50);
    expect(transactionReport.qty).toBe(25);
    expect(transactionReport.timestamp).toBeGreaterThanOrEqual(tstamp);
  });
  it("initialQty is maintained after transactions", async () => {
    const tstamp = Date.now();
    await new Promise((res) => setTimeout(res, 10));
    const o1 = new Order("123", OrderType.LIMIT, -50, 50);
    const o2 = new Order("abc", OrderType.MARKET, 25, NaN);
    o2.execute(o1);

    expect(o1.qty).toBe(-25);
    expect(o2.qty).toBe(0);

    expect(o1.initialQty).toBe(-50);
    expect(o2.initialQty).toBe(25);
  });
});
