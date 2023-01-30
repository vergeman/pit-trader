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
});
