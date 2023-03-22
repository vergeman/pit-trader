import MatchingEngine from "../engine/MatchingEngine";
import { Order, OrderType, OrderStatus } from "../engine/Order";
import { Player } from "./Player";
import NPCPlayerManager from "./NPCPlayerManager";
import { MarketLoop } from "./MarketLoop";

describe("MarketLoop", () => {
  it("startLoop() calls run() which takes a duration of numPlayers * maxTurnDelay", async () => {
    const me = new MatchingEngine();
    const initPlayers = [
      new Player("test1"),
      new Player("test2"),
      new Player("test3"),
    ];
    const pm = new NPCPlayerManager(me, initPlayers);
    const ml = new MarketLoop(pm, 100, 4);

    const maxTurnDelay = 20;
    ml.turn = jest.fn(() => {}) as jest.Mock;

    const start = Date.now();
    await ml.run(maxTurnDelay, 10);
    const end = Date.now();

    const runCount = (ml.turn as jest.Mock).mock.calls.length;
    expect(runCount).toBe(pm.numPlayers);

    //also test less than some arbitrary noise
    expect(end - start).toBeGreaterThan(maxTurnDelay * pm.numPlayers);
    expect(end - start).toBeLessThan((maxTurnDelay + 10) * pm.numPlayers);
  });

  it("run() calls replenishAll() to replenish any executed orders", async () => {
    const me = new MatchingEngine();
    const initPlayers = [
      new Player("test1"),
      new Player("test2"),
      new Player("test3"),
    ];
    const pm = new NPCPlayerManager(me, initPlayers);
    const ml = new MarketLoop(pm, 100, 4);
    ml.init();

    ml.replenishAll = jest.fn(() => {}) as jest.Mock;
    let runCount = (ml.replenishAll as jest.Mock).mock.calls.length;
    expect(runCount).toBe(0);
    await ml.run(20, 10);
    runCount = (ml.replenishAll as jest.Mock).mock.calls.length;
    expect(runCount).toBe(1);
  });

  describe("init()", () => {
    it("init() populates respective players orders in player's and matching engine queues", () => {
      const me = new MatchingEngine();
      const ordered = [new Player("a"), new Player("b"), new Player("c")];
      const pm = new NPCPlayerManager(me, ordered);
      const ml = new MarketLoop(pm, 50, 4);
      ml.init();

      //ensure player has orders
      expect(
        ordered.every((player) => player.orders.length === 2)
      ).toBeTruthy();

      //ensure orders submitted to MatchingEngine
      for (let player of ordered) {
        for (let order of player.orders) {
          expect(
            me.bids.contains(order) || me.offers.contains(order)
          ).toBeTruthy();
        }
      }
    });

    it("init() creates list of players and with submitted bid/offer orders with same midpoint price and qtySeed limits", () => {
      const me = new MatchingEngine();
      const ordered = [new Player("a"), new Player("b"), new Player("c")];
      const qtySeed = 4;
      const pm = new NPCPlayerManager(me, ordered);
      const ml = new MarketLoop(pm, 100, 4);
      ml.init();

      const midpoints = [];
      for (let player of ordered) {
        expect(
          player.orders.every(
            (order) =>
              Math.abs(order.qty) <= qtySeed + 1 && Math.abs(order.qty) >= 1
          )
        ).toBeTruthy();
        expect(player.orders.length).toBe(2);
        const midpoint: number =
          player.orders.reduce((sum, order) => sum + order.price, 0) / 2;
        midpoints.push(midpoint);
      }

      //midpoint prices are all the same
      let j = midpoints.length - 1;
      for (let i = 0; i < midpoints.length; i++) {
        expect(midpoints[i] === midpoints[j]).toBeTruthy();
        j--;
      }
    });
  });

  describe("turn()", () => {
    it("players update order each turn and eventually execute", () => {
      const me = new MatchingEngine();
      const players = [
        new Player("test1"),
        new Player("test2"),
        new Player("test3"),
      ];
      const pm = new NPCPlayerManager(me, players);
      const ml = new MarketLoop(pm, 100, 4);
      ml.init();

      for (const player of players) {
        const oldPrices = player.orders.map((order) => order.price);
        ml.turn(player, 0);
        //change in price or execution
        const hasPriceChange = !player.orders.every((order) =>
          oldPrices.includes(order.price)
        );
        const hasFill = player.orders.some(
          (order) => order.transactions.length
        );
        expect(hasPriceChange || hasFill).toBeTruthy();
      }
    });
  });

  describe("replenishAll()", () => {
    it("replenishes all executed bid/offers in players queue, and submitted to ME via me.process()", () => {
      const me = new MatchingEngine();
      const players = [
        new Player("test1"),
        new Player("test2"),
        new Player("test3"),
        new Player("test4"),
        new Player("test5"),
      ];

      const pm = new NPCPlayerManager(me, players);
      const ml = new MarketLoop(pm, 100, 4);

      ml.init();
      for (const player of players) {
        ml.turn(player, 0);
      }

      const hasExecuted = players.some(
        (player) =>
          player.getLiveBids().length < 1 || player.getLiveOffers().length < 1
      );
      expect(hasExecuted).toBeTruthy();

      //replenish here
      const numReplenished = ml.replenishAll();

      //check player queue
      const refilled = players.every(
        (player) =>
          player.getLiveBids().length >= 1 && player.getLiveOffers().length >= 1
      );

      //check me
      const liveOrders = players
        .map((player) =>
          player.orders.filter((order) => order.status === OrderStatus.Live)
        )
        .flat();

      expect(
        liveOrders.every(
          (order) => me.bids.contains(order) || me.offers.contains(order)
        )
      ).toBeTruthy();

      expect(refilled).toBeTruthy();
      expect(numReplenished).toBeGreaterThan(0);
    });
  });

  describe("getPrice()", () => {
    it("getPrice() returns midpoint based on seed (nothing traded)", () => {
      const priceSeed = 100;
      const me = new MatchingEngine();
      const players = [new Player("a"), new Player("b"), new Player("c")];
      const pm = new NPCPlayerManager(me, players);
      const marketLoop = new MarketLoop(pm, priceSeed, 4);
      marketLoop.init();
      const price = marketLoop.getPrice();

      expect(price).toBe(priceSeed);
    });

    it("getPrice() returns midpoint of live markets when nothing traded", () => {
      const priceSeed = 100;
      const me = new MatchingEngine();
      const players = [new Player("a")];
      const pm = new NPCPlayerManager(me, players);
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
      const pm = new NPCPlayerManager(me, players);
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
