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

  describe("position & pl calculations", () => {
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

      //now player sells 10
      const o5 = new Order("abc", OrderType.Limit, 10, 102);
      me.process(o5);
      const o6 = new Order(p.id, OrderType.Limit, -10, 102);
      p.addOrder(o6);
      me.process(o6);
      expect(p.openPosition()).toBe(-10);
    });

    it("workingPosition() returns net position of submitted but not filled orders", () => {
      const p = new Player("test");
      const me = new MatchingEngine();
      const o1 = new Order(p.id, OrderType.Limit, 10, 100);
      const o2 = new Order("123", OrderType.Limit, -3, 100);

      p.addOrder(o1);
      //submit order: nothing filled
      me.process(o1);
      expect(p.openPosition()).toBe(0);

      //bought 3
      me.process(o2);
      expect(p.openPosition()).toBe(3);
      expect(p.workingPosition()).toBe(7);

      //work 3 more bid and 3 more offer
      //workingPosition and openPosition are net values
      const o3 = new Order(p.id, OrderType.Limit, 3, 102);
      const o4 = new Order(p.id, OrderType.Limit, -3, 105);
      p.addOrder(o3);
      me.process(o3);
      p.addOrder(o4);
      me.process(o4);

      expect(p.openPosition()).toBe(3);
      expect(p.workingPosition()).toBe(7);
      expect(p.openPosition() + p.workingPosition()).toBe(3 + 7);
    });

    it("calcPnL() returns MTM value of player's transactions", () => {
      //working orders has no mtm effect
      const p = new Player("test", true, { tick: 1000, limitPL: -1000000 });
      const me = new MatchingEngine();
      const o1b = new Order(p.id, OrderType.Limit, 10, 100);
      const o1s = new Order(p.id, OrderType.Limit, -10, 101);
      p.addOrder(o1b);
      p.addOrder(o1s);
      me.process(o1b);
      me.process(o1s);
      //expect(p.calcPnL(1000)).toBe(0);

      //has a limit fill (floating MTM on price)
      const o2 = new Order('123"', OrderType.Limit, -10, 100);
      me.process(o2);
      expect(p.calcPnL(103)).toBe(30000);

      //flat position - buy 100, sold 101, so MTM locked
      const o3 = new Order("123", OrderType.Limit, 10, 101);
      me.process(o3);
      expect(p.calcPnL(1000)).toBe(10000);

      //has a market fill (floating) and cumulative p&l
      const o4 = new Order("123", OrderType.Limit, -5, 100);
      const o5 = new Order("123", OrderType.Limit, -5, 101);
      me.process(o4);
      me.process(o5);

      const o6 = new Order(p.id, OrderType.Market, 10, NaN);
      p.addOrder(o6);
      me.process(o6);

      //carry 10000 from previous, long 10 avg fill of 100.5
      expect(p.calcPnL(100.5)).toBe(10000 + 0);
      expect(p.calcPnL(101.5)).toBe(10000 + 10000);

      //order is cancelled, same as before
      const o7 = new Order(p.id, OrderType.Limit, -10, 100);
      p.addOrder(o7);
      me.process(o7);
      me.cancel(o7);
      expect(p.calcPnL(101.5)).toBe(10000 + 10000);

      //still long 10
      //partial fill 5 @ 100.5, then order cancelled
      const o8 = new Order(p.id, OrderType.Limit, -10, 101.5);
      p.addOrder(o8);
      me.process(o8);
      const o9 = new Order("123", OrderType.Market, 5, NaN);
      me.process(o9);

      //MTM no change from previous
      expect(p.calcPnL(101.5)).toBe(10000 + 10000 + 0);

      //MTM net:previous 10k, 10 lots imroved and 5 lots "loss"
      expect(p.calcPnL(102.5)).toBe(10000 + 20000 - 5000);

      me.cancel(o8);
      //still long 5
      expect(p.calcPnL(103.5)).toBe(10000 + 30000 - 10000);
    });

    it("hasLost() returns true if player exceeds limitPL", () => {
      const p = new Player("test", true, { tick: 1000, limitPL: -1000000 });
      const me = new MatchingEngine();
      const o1 = new Order(p.id, OrderType.Limit, 100, 100);
      const o2 = new Order(p.id, OrderType.Limit, -100, 100);

      p.addOrder(o1);
      me.process(o1);
      me.process(o2);

      expect(p.hasLost(10000)).toBeFalsy();
      expect(p.hasLost(100)).toBeFalsy();
      expect(p.hasLost(1)).toBeTruthy();
    });
  });

  it("calcDisplayAvgPrice() returns weighted average price of fills formatted for display", () => {
    //working orders has no mtm effect
    const p = new Player("test", true, { tick: 1000, limitPL: -1000000 });
    const me = new MatchingEngine();
    const o1b = new Order(p.id, OrderType.Limit, 10, 100);
    const o1b2 = new Order(p.id, OrderType.Limit, 1000, 80);
    p.addOrder(o1b);
    p.addOrder(o1b2);
    me.process(o1b);
    me.process(o1b2);
    //just markets, no executed trades yet
    expect(p.calcDisplayAvgPrice()).toBe(null);

    const o2 = new Order('123"', OrderType.Limit, -10, 100);
    const o3 = new Order('123"', OrderType.Limit, -1000, 80);
    me.process(o2);
    me.process(o3);
    const wAvgPrice = Number(((10 * 100 + 1000 * 80) / 1010).toFixed(3));
    expect(p.calcDisplayAvgPrice()).toBe(wAvgPrice);
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

  it("calcPnL sets maxPnL member variable", () => {
    const p = new Player("test", true, { tick: 1000, limitPL: -1000000 });
    const me = new MatchingEngine();
    const o1b = new Order(p.id, OrderType.Limit, 10, 100);
    const o1s = new Order(p.id, OrderType.Limit, -10, 101);
    p.addOrder(o1b);
    p.addOrder(o1s);
    me.process(o1b);
    me.process(o1s);

    //NB: player test is long 10
    const o2 = new Order('123"', OrderType.Limit, -10, 100);
    me.process(o2);
    expect(p.calcPnL(103)).toBe(30000);
    expect(p.maxPnL).toBe(30000);
    expect(p.calcPnL(102)).toBe(20000);
    expect(p.maxPnL).toBe(30000);
  });
  //pending:
  //needs last traded or best price; market info
  //need to determine if bid or offer order
});
