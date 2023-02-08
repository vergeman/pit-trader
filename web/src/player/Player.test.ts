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

  describe("position calculations", () => {
    it("openPosition() returns net position of executed orders", () => {
      const p = new Player("test");
      const me = new MatchingEngine();
      const o1 = new Order(p.id, OrderType.Limit, 10, 100);
      const o2 = new Order("123", OrderType.Limit, -3, 100);

      expect(p.openPosition()).toBe(0);
      p.addOrder(o1);
      //submit order: nothing filled
      me.process(o1);
      expect(p.openPosition()).toBe(0);
      //bought 3
      me.process(o2);
      expect(p.openPosition()).toBe(3);
      //offer 3
      const o3 = new Order(p.id, OrderType.Limit, -3, 102);
      p.addOrder(o3);
      const o4 = new Order("abc", OrderType.Limit, 3, 102);
      me.process(o3);
      //transact offer, player position net 0
      me.process(o4);
      expect(p.openPosition()).toBe(0);
    });
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
