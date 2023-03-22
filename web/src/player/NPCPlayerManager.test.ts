import Player from "./Player";
import NPCPlayerManager from "./NPCPlayerManager";
import MatchingEngine from "../engine/MatchingEngine";

describe("NPCPlayerManager", () => {
  it("sets initial players in object of id-player", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const pm = new NPCPlayerManager(me, [player_a, player_b]);

    expect(Object.keys(pm.players).includes(player_a.id)).toBeTruthy();
    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
  });

  it("addPlayer() adds to players obj", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const pm = new NPCPlayerManager(me, [player_a]);
    pm.addPlayer(player_b);

    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
    expect(Object.keys(pm.players).length).toBe(2);
  });

  it("randomzedPlayerList() returns randomly ordered list of players", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a");
    const player_b = new Player("b");
    const player_c = new Player("c");
    const player_d = new Player("d");

    let ordered = [player_a, player_b, player_c, player_d];
    const pm = new NPCPlayerManager(me, ordered);

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
});
