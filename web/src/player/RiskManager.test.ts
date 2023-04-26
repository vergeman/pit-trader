import RiskManager from "./RiskManager";

describe("RiskManager", () => {
  it("sets positionLimit and warnPositionLimit from named params via constructor", () => {
    const config = {
      positionLimit: 30,
      warnPositionLimit: 10,
      tick: 1000,
      limitPL: -1000,
    };
    const riskManager = new RiskManager({ ...config });
    expect(riskManager.positionLimit).toBe(config.positionLimit);
    expect(riskManager.warnPositionLimit).toBe(config.warnPositionLimit);
  });

  it.todo(
    "calcPositions calculates player positions + those of any to-be submitted orders"
  );
  it.todo(
    "calcLimit: takes _calcPositions value, and tests against positionLimit threshold(used in GGEvent: submitOrder"
  );
  it.todo(
    "isWarn: takes _calcPositions value and tests against warn threshold(no orders, used in playerStatus)"
  );
});
