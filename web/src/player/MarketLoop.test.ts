import MatchingEngine from "../engine/MatchingEngine";
import { Order, OrderType } from "../engine/Order";
import { Player } from "./Player";
import { PlayerManager } from "./PlayerManager";
import { MarketLoop } from "./MarketLoop";

describe("MarketLoop", () => {

  it("startLoop() calls run() at a specified setInterval and stop() clears it", async () => {
    const me = new MatchingEngine();
    const pm = new PlayerManager(me, []);
    const ml = new MarketLoop(pm, 100, 4);

    ml.run = jest.fn(() => {}) as jest.Mock;
    ml.startLoop(10);

    await new Promise((res) => setTimeout(res, 100));
    expect((ml.run as jest.Mock).mock.calls.length).toBeLessThanOrEqual(10);
    expect((ml.run as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(9);
    ml.stopLoop();
    await new Promise((res) => setTimeout(res, 100));
    expect((ml.run as jest.Mock).mock.calls.length).toBeLessThanOrEqual(10);
    expect((ml.run as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(9);
  });

  it("run() generates new deltas, iterates a turn() through each npc player, and replenishes any executed orders", async () => {
    const me = new MatchingEngine();
    const initPlayers = [
      new Player("test1"),
      new Player("test2"),
      new Player("test3"),
    ];
    const pm = new PlayerManager(me, initPlayers);
    const p = new MarketLoop(pm, 100, 4);

    await p.run(1);

    // p.startLoop(10);
    // await new Promise(res => setTimeout(res, 20));
    // p.stopLoop();

    //expect(typeof p.id).toBeTruthy();
  });

  //WORKING HERE
  describe("turn()", () => {
    //it
  });

  describe("getPrice()", () => {
    it("getPrice() returns midpoint based on seed (nothing traded)", () => {
      const priceSeed = 100;
      const me = new MatchingEngine();
      const players = [new Player("a"), new Player("b"), new Player("c")];
      const pm = new PlayerManager(me, players);
      const marketLoop = new MarketLoop(pm, priceSeed, 4);
      marketLoop.init();
      const price = marketLoop.getPrice();

      expect(price).toBe(priceSeed);
    });

    it("getPrice() returns midpoint of live markets when nothing traded", () => {
      const priceSeed = 100;
      const me = new MatchingEngine();
      const players = [new Player("a")];
      const pm = new PlayerManager(me, players);
      const marketLoop = new MarketLoop(pm, priceSeed, 4);

      const order1 = new Order(players[0].id, OrderType.Limit, 1, 100);
      const order2 = new Order(players[0].id, OrderType.Limit, -1, 102);
      me.process(order1);
      me.process(order2);
      const price = marketLoop.getPrice();
      expect(price).toBe(101);
    });

    it("getPrice() returns last trade for subsequent bid/offer", () => {
      const priceSeed = 100;
      const me = new MatchingEngine();
      const players = [new Player("a"), new Player("b"), new Player("c")];
      const pm = new PlayerManager(me, players);
      const marketLoop = new MarketLoop(pm, priceSeed, 4);
      marketLoop.init();

      const order = new Order(players[0].id, OrderType.Market, 1, NaN);
      const bestOffer = me.offers.peek();
      const tradePrice = bestOffer && bestOffer.price;

      me.process(order);

      const price = marketLoop.getPrice();
      expect(price).toBeGreaterThan(priceSeed);
      expect(price).toBe(tradePrice);
    });
  });
});
