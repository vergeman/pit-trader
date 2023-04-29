import { Gesture, GestureAction, GestureType } from "./Gesture";

describe("Gesture", () => {
  it("allows string / enum behavior in constructor", () => {
    const meta = {
      type: "Price",
      action: "Buy",
      value: 100,
    };

    const g = new Gesture(
      meta.type as GestureType,
      meta.action as GestureAction,
      meta.value,
      1
    );

    expect(g.type).toEqual(GestureType.PRICE);
    expect(g.action).toEqual(GestureAction.BUY);
    expect(g.value).toEqual(100);
    expect(g.prob).toEqual(1);
    expect(g.digit_length()).toEqual(3);
  });
});
