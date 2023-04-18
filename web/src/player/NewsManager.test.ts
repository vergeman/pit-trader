import NewsManager from "./NewsManager";

describe("NewsManager", () => {
  it("locks createEvent()", () => {
    const nm = new NewsManager();
    const numIter = 5;
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < numIter) {
      const e = nm.createEvent();
      e ? j++ : k++;
      i++;
    }
    expect(j).toBe(1);
    expect(k).toBe(numIter - 1);
    expect(nm.hasEvent).toBe(true);
  });
});
