import MatchingEngine from "../engine/MatchingEngine";
import Order, { OrderType } from "../engine/Order";
import Player from "./Player";
import RiskManager from "./RiskManager";
import configs from "../Configs";

describe("RiskManager", () => {
  it("sets positionLimit and warnPositionLimit from named params via constructor", () => {

    const config = {
      positionLimit: 30,
      warnPositionLimit: 10,
      tick: 1000,
      limitPnL: -1000,
    }
    configs[0] = { ...configs[0], ...config };

    const riskManager = new RiskManager(configs);
    expect(riskManager.positionLimit()).toBe(configs[0].positionLimit);
    expect(riskManager.warnPositionLimit()).toBe(configs[0].warnPositionLimit);
  });

  it("_calcPositions calculates player positions + those of any to-be submitted orders", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
    };
    configs[0] = { ...configs[0], ...config };

    const me = new MatchingEngine();
    const riskManager = new RiskManager(configs);
    const player = new Player("Test", false, configs);

    expect(riskManager._calcPositions(player)).toEqual({
      total: 0,
      open: 0,
      working: 0,
      orders: 0,
    });

    const o1 = new Order("test", OrderType.LIMIT, 15, 100);
    const o2 = new Order("test2", OrderType.LIMIT, -10, 100);
    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process() -> position 10 lots, working 5, 0 pre-submit
    expect(riskManager._calcPositions(player)).toEqual({
      total: 15,
      open: 10,
      working: 5,
      orders: 0,
    }); //15

    //no prospective orders
    expect(riskManager._calcPositions(player, [])).toEqual({
      total: 15,
      open: 10,
      working: 5,
      orders: 0,
    }); //15

    //prospective orders
    const orders = [
      new Order("test", OrderType.LIMIT, 5, 100),
      new Order("test", OrderType.LIMIT, 25, 100),
    ];
    expect(riskManager._calcPositions(player, orders)).toEqual({
      total: 45,
      open: 10,
      working: 5,
      orders: 30,
    }); //15 + 30
  });

  it("exceedsLimit: takes _calcPositions value, and tests against positionLimit threshold(used in GGEvent: submitOrder", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
    };
    configs[0] = { ...configs[0], ...config };

    const me = new MatchingEngine();
    const riskManager = new RiskManager(configs);
    const player = new Player("Test", false, configs);

    expect(riskManager.exceedsLimit(player, config.positionLimit).exceedsLimit).toBeFalsy();

    const o1 = new Order("test", OrderType.LIMIT, 15, 100);
    const o2 = new Order("test2", OrderType.LIMIT, -10, 100);

    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process execute 10 lots
    expect(riskManager.exceedsLimit(player, config.positionLimit).exceedsLimit).toBeFalsy(); //10

    const o3 = new Order("test", OrderType.LIMIT, 20, 100);
    expect(riskManager.exceedsLimit(player, config.positionLimit, [o3]).exceedsLimit).toBeTruthy(); //30 > 25
  });

  it("warnLimit: takes _calcPositions value and tests against warnPositionLimit (used in playerStatus)", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
    };
    configs[0] = { ...configs[0], ...config };

    const me = new MatchingEngine();
    const riskManager = new RiskManager(configs);
    const player = new Player("Test", false, configs);

    expect(riskManager.exceedsLimit(player, config.warnPositionLimit).exceedsLimit).toBeFalsy();

    const o1 = new Order("test", OrderType.LIMIT, 15, 100);
    const o2 = new Order("test2", OrderType.LIMIT, -10, 100);

    player.addOrder(o1);
    me.process(o1);
    me.process(o2);

    //me.process execute 10 lots, working 5
    expect(riskManager.exceedsLimit(player, config.positionLimit).exceedsLimit).toBeFalsy(); //15

    const o3 = new Order("test", OrderType.LIMIT, 6, 100);
    expect(riskManager.exceedsLimit(player, config.warnPositionLimit, [o3]).exceedsLimit).toBeTruthy(); //21 > 20 warn
    expect(riskManager.exceedsLimit(player, config.positionLimit, [o3]).exceedsLimit).toBeFalsy(); //21 !> 25
  });


  it("exceedsMaxOrder returns absolute value of submitted (working) orders and to-be-submitted orders", () => {
    const config = {
      positionLimit: 25,
      warnPositionLimit: 20,
      maxOrderLimit: 40
    };
    configs[0] = { ...configs[0], ...config };

    const me = new MatchingEngine();
    const riskManager = new RiskManager(configs);
    const player = new Player("Test", false, configs);

    const o1 = new Order("test", OrderType.LIMIT, 15, 100);
    const o2 = new Order("test", OrderType.LIMIT, -15, 102);

    player.addOrder(o1);
    player.addOrder(o2);
    me.process(o1);
    me.process(o2);

    expect(riskManager.exceedsMaxOrder(player, config.maxOrderLimit).exceedsMaxOrder).toBeFalsy();
    const o3 = new Order("test", OrderType.LIMIT, -15, 102);
    const o4 = new Order("test", OrderType.LIMIT, 15, 102);
    const o5 = new Order("test", OrderType.LIMIT, 5, 102);
    expect(riskManager.exceedsMaxOrder(player, config.maxOrderLimit, [o3]).exceedsMaxOrder).toBeTruthy();
    expect(riskManager.exceedsMaxOrder(player, config.maxOrderLimit, [o4]).exceedsMaxOrder).toBeTruthy();
    expect(riskManager.exceedsMaxOrder(player, config.maxOrderLimit, [o5]).exceedsMaxOrder).toBeFalsy();
  });

});
