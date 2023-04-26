import MatchingEngine from "../engine/MatchingEngine";
import Order, { OrderType } from "../engine/Order";
import Player from "./Player";
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

  it("_calcPositions calculates player positions + those of any to-be submitted orders", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 5,
    };

    const me = new MatchingEngine();
    const riskManager = new RiskManager({ ...config });
    const player = new Player("Test");

    expect(riskManager._calcPositions(player)).toBe(0);

    const o1 = new Order("test", OrderType.Limit, 15, 100);
    const o2 = new Order("test2", OrderType.Limit, -10, 100);
    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process() -> position 10 lots, working 5, 0 pre-submit
    expect(riskManager._calcPositions(player)).toBe(15);

    //no prospective orders
    expect(riskManager._calcPositions(player, [])).toBe(15);

    //prospective orders
    const orders = [
      new Order("test", OrderType.Limit, 5, 100),
      new Order("test", OrderType.Limit, 25, 100),
    ];
    expect(riskManager._calcPositions(player, orders)).toBe(15 + 30);
  });

  it("exceedsLimit: takes _calcPositions value, and tests against positionLimit threshold(used in GGEvent: submitOrder", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
    };

    const me = new MatchingEngine();
    const riskManager = new RiskManager({ ...config });
    const player = new Player("Test");

    expect(riskManager.exceedsLimit(player)).toBeFalsy();

    const o1 = new Order("test", OrderType.Limit, 15, 100);
    const o2 = new Order("test2", OrderType.Limit, -10, 100);

    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process execute 10 lots
    expect(riskManager.exceedsLimit(player)).toBeFalsy(); //10

    const o3 = new Order("test", OrderType.Limit, 20, 100);
    expect(riskManager.exceedsLimit(player, [o3])).toBeTruthy(); //30 > 25
  });

  it("warnLimit: takes _calcPositions value and tests against warnPositionLimit (used in playerStatus)", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
    };

    const me = new MatchingEngine();
    const riskManager = new RiskManager({ ...config });
    const player = new Player("Test");

    expect(riskManager.exceedsLimit(player)).toBeFalsy();

    const o1 = new Order("test", OrderType.Limit, 15, 100);
    const o2 = new Order("test2", OrderType.Limit, -10, 100);

    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process execute 10 lots, working 5
    expect(riskManager.exceedsLimit(player)).toBeFalsy(); //15

    const o3 = new Order("test", OrderType.Limit, 6, 100);
    expect(riskManager.warnLimit(player, [o3])).toBeTruthy(); //21 > 20 warn
    expect(riskManager.exceedsLimit(player, [o3])).toBeFalsy(); //21 !> 25
  });

});
