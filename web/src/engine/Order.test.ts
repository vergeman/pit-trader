import { OrderType, Order } from "./Order";

describe("Order", () => {
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
});
