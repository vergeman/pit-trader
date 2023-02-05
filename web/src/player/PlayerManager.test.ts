import Player from "./Player";
import PlayerManager from "./PlayerManager";
import MatchingEngine from "../engine/MatchingEngine";

describe("PlayerManager", () => {
  it("sets initial players in object of id-player", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const pm = new PlayerManager(me, [player_a, player_b]);

    expect(Object.keys(pm.players).includes(player_a.id)).toBeTruthy();
    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
  });

  it("addPlayer() adds to players obj", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const pm = new PlayerManager(me, [player_a]);
    pm.addPlayer(player_b);

    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
    expect(Object.keys(pm.players).length).toBe(2);
  });

  it("init() populates respective players orders in player's and matching engine queues", () => {
    const me = new MatchingEngine();
    const ordered = [new Player("a"), new Player("b"), new Player("c")];
    const pm = new PlayerManager(me, ordered);
    pm.init(50);

    //ensure player has orders
    expect(ordered.every((player) => player.orders.length === 2)).toBeTruthy();

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
    const pm = new PlayerManager(me, ordered);
    pm.init();

    const midpoints = [];
    for (let player of ordered) {
      expect(
        player.orders.every(
          (order) => Math.abs(order.qty) <= 5 && Math.abs(order.qty) >= 1
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

  it("randomzedPlayerList() returns randomly ordered list of players", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const player_c = new Player("c");
    const player_d = new Player("d");

    let ordered = [player_a, player_b, player_c, player_d];
    const pm = new PlayerManager(me, ordered);

    let notExact = false;
    let i = 10;
    while (i) {
      const players = pm.getRandomizedPlayerList();
      if (!players.every((player, i) => player === ordered[i])) {
        notExact = true;
      }
      i--;
    }

    //"as long as they aren't _all_ the same"
    expect(notExact).toBeTruthy();
  });

  it("_generateRandomDelta() generates a number from .1 to .5", () => {
    const me = new MatchingEngine();
    const pm = new PlayerManager(me, []);
    let i = 10;

    while (i) {
      const d = pm.generateRandomDelta();
      expect(d).toBeGreaterThanOrEqual(0.1);
      expect(d).toBeLessThanOrEqual(0.5);
      i--;
    }
  });

  it("setNewDeltas(): sets random deltas per player", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    let players = [player_a, player_b];
    const pm = new PlayerManager(me, players);

    //verify initial deltas 0
    expect(players.every(player => player.delta === 0)).toBeTruthy();
    pm.setNewDeltas();
    //deltas different after time
    expect(players.every(player => player.delta !== 0)).toBeTruthy();
  })

});
