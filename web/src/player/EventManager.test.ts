import EventManager from "./EventManager";

describe("EventManager", () => {
  it("locks createEvent()", () => {
    const nm = new EventManager();
    const numIter = 5;
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < numIter) {
      const event = nm.createEvent();
      nm.hasEvent++;
      event ? j++ : k++;
      i++;
    }
    expect(j).toBe(1);
    expect(k).toBe(numIter - 1);
    expect(nm.hasEvent).toBe(numIter);
  });
});
