import { Player } from "./Player";
import { Order, OrderType, OrderStatus } from "../engine/Order";
import MatchingEngine from "../engine/MatchingEngine";

describe("Player", () => {
  it("generates an id on instance", () => {
    const p = new Player("test");
    expect(typeof p.id).toBeTruthy();
  });

  it("hasLiveBids() filters for live bids", () => {
    const p = new Player("test");
    const me = new MatchingEngine();
    const order = new Order(p.id, OrderType.Limit, 1, 100);
    me.process(order); //Sets to Status to live
    p.addOrder(order); //adds to player's internal list

    expect(p.hasLiveOffers()).toBeFalsy();
    expect(p.hasLiveBids()).toBeTruthy();
  });

  it("hasLiveOffers() filters for live offers", () => {
    const p = new Player("test");
    const me = new MatchingEngine();
    const order = new Order(p.id, OrderType.Limit, -1, 100);
    me.process(order); //Sets to Status to live
    p.addOrder(order); //adds to player's internal list

    expect(p.hasLiveOffers()).toBeTruthy();
    expect(p.hasLiveBids()).toBeFalsy();
  });

  it("generateRandomMax() default generates a number from 1 to 5", () => {
    const p = new Player("test");
    let i = 10;

    while (i) {
      const d = p.generateRandomMax();
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(5);
      i--;
    }
  });

  it("calcSkipTurn() returns boolean if player should skip turn", () => {
    const p = new Player("test");
    expect(p.calcSkipTurn(1.01)).toBeTruthy();
    expect(p.calcSkipTurn(-0.01)).toBeFalsy();
  });

  it("calcMaxBidOfferDelta() ensures own bids/offers are not exceeded", () => {
    const p = new Player("test");
    const order1 = new Order(p.id, OrderType.Limit, 1, 100.4);
    const order2 = new Order(p.id, OrderType.Limit, -1, 101.3);
    const order3 = new Order(p.id, OrderType.Limit, 1, 101);
    order1.status = OrderStatus.Live;
    order2.status = OrderStatus.Live;
    order3.status = OrderStatus.Live;
    p.addOrder(order1);
    p.addOrder(order2);
    expect(p.calcMaxBidOfferDelta()).toBe(0.8);

    p.addOrder(order3);
    expect(p.calcMaxBidOfferDelta()).toBe(0.2);
  });

  it("calcMaxBidOfferDelta() works with no bids/offers", () => {
    const p = new Player("test");
    const _default = 0.4;
    expect(p.calcMaxBidOfferDelta(_default)).toBe(_default);
    expect(p.calcMaxBidOfferDelta()).toBe(0.5);
  });

  it("replenish(): generates new Live orders and adds to players own queue", () => {
    const p = new Player("test");
    const me = new MatchingEngine();
    expect(p.orders.length).toBe(0);
    p.replenish(100, 4);
    expect(p.orders.length).toBe(2);
  });

  //pending:
  //needs last traded or best price; market info
  //need to determine if bid or offer order
});
