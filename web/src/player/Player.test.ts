import { Player } from "./Player";

describe("Player", () => {
  it("generates an id on instance", () => {
    const p = new Player("test");
    expect(typeof p.id).toBeTruthy();
  });

  it.todo("replenish(): generate new orders")
  //pending:
  //needs last traded or best price; market info
  //need to determine if bid or offer order

});
