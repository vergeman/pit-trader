import { Player } from "./Player";

describe("Player", () => {
  it("generates an id on instance", () => {
    const p = new Player();
    expect(typeof p.id).toBeTruthy();
  });
});
