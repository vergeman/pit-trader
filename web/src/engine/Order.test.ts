import { OrderType, Order } from "./Order";

describe("Order", () => {
  it("maintains accurate timestamps", async () => {
    const o1 = new Order(OrderType.Market, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const o2 = new Order(OrderType.Market, -50, 100);

    expect(o2.timestamp > o1.timestamp).toBeTruthy();
  });

  it("increments and decrements", () => {});

  it("maintains qty", () => {});
});
