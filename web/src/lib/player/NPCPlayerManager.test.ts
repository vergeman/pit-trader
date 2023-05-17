import Player from "./Player";
import NPCPlayerManager from "./NPCPlayerManager";
import MatchingEngine from "../exchange/MatchingEngine";
import configs from "../../Configs";

describe("NPCPlayerManager", () => {
  it("sets initial players in object of id-player", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a", false, configs);
    const player_b = new Player("b", false, configs);
    const pm = new NPCPlayerManager(me, [player_a, player_b]);

    expect(Object.keys(pm.players).includes(player_a.id)).toBeTruthy();
    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
  });

  it("addPlayer() adds to players obj", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a", false, configs);
    const player_b = new Player("b", false, configs);
    const pm = new NPCPlayerManager(me, [player_a]);
    pm.addPlayer(player_b);

    expect(Object.keys(pm.players).includes(player_b.id)).toBeTruthy();
    expect(Object.keys(pm.players).length).toBe(2);
  });

  it("randomzedPlayerList() returns randomly ordered list of players", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a", false, configs);
    const player_b = new Player("b", false, configs);
    const player_c = new Player("c", false, configs);
    const player_d = new Player("d", false, configs);

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

  it("removes Player by id", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a", false, configs);
    const player_b = new Player("b", false, configs);
    const player_c = new Player("c", false, configs);
    const player_d = new Player("d", false, configs);

    let ordered = [player_a, player_b, player_c, player_d];
    const pm = new NPCPlayerManager(me, ordered);
    expect(pm.numPlayers).toBe(4);

    pm.markRemovePlayer(player_b.id);
    for (const player of Object.values(pm.players)) {
      if (player.markRemoved) {
        pm.deletePlayer(player.id);
      }
    }

    expect(pm.numPlayers).toBe(3);
    expect(pm.players[player_a.id]).toBe(player_a);
    expect(pm.players[player_b.id]).toBe(undefined);
    expect(pm.players[player_c.id]).toBe(player_c);
  });

  it("removes players by group_id", () => {
    const me = new MatchingEngine();
    const player_a = new Player("a", false, configs);
    const player_b = new Player("b", false, configs);
    const player_c = new Player("c", false, configs);
    const player_d = new Player("d", false, configs);

    player_b.group_id = "test";
    player_d.group_id = "test";

    let ordered = [player_a, player_b, player_c, player_d];
    const pm = new NPCPlayerManager(me, ordered);

    expect(pm.numPlayers).toBe(4);
    pm.markRemoveGroup("test");
    for (const player of Object.values(pm.players)) {
      if (player.markRemoved) {
        pm.deletePlayer(player.id);
      }
    }

    expect(pm.numPlayers).toBe(2);
    expect(pm.players[player_a.id]).toBe(player_a);
    expect(pm.players[player_b.id]).toBe(undefined);
    expect(pm.players[player_c.id]).toBe(player_c);
    expect(pm.players[player_d.id]).toBe(undefined);
  });
});
