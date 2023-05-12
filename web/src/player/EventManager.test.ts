import MatchingEngine from "../engine/MatchingEngine";
import Player from "./Player";
import NPCPlayerManager from "./NPCPlayerManager";
import MarketLoop from "./MarketLoop";
import EventManager from "./EventManager";
import RiskManager from "../player/RiskManager";
import GestureDecision from "../gesture/GestureDecision";
import configs from "../Configs";

describe("EventManager", () => {
  it("generate locks further event creation()", () => {
    const me = new MatchingEngine();
    const initPlayers = [
      new Player("test1", false, configs),
      new Player("test2", false, configs),
      new Player("test3", false, configs),
    ];
    const npcPlayerManager = new NPCPlayerManager(me, initPlayers);
    const ml = new MarketLoop({ npcPlayerManager, priceSeed: 100, qtySeed: 4 });
    const p = new Player("test", true, configs);
    const riskManager = new RiskManager(configs);
    const gd = new GestureDecision(me, ml, p, riskManager);

    const config = { gsetureDecisionEvent: { duration: 10000, probability: 0.25, bonus: 1 } }
    configs[0] = {...configs[0], ...config};

    const eventManager = new EventManager(ml, gd, configs);
    const numIter = 5;
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < numIter) {
      const event = eventManager.generate(i);
      if (i > 1) expect(event).toBe(null);

      eventManager.hasEvent() ? j++ : k++;
      event && event.begin();
      i++;
    }
    expect(j).toBe(numIter - 1);
    expect(k).toBe(1);
    expect(eventManager.hasEvent()).toBe(true);
  });
});
