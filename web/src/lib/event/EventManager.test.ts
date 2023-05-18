import MatchingEngine from "../exchange/MatchingEngine";
import Player from "../player/Player";
import NPCPlayerManager from "../player/NPCPlayerManager";
import MarketLoop from "../exchange/MarketLoop";
import EventManager from "./EventManager";
import RiskManager from "../exchange/RiskManager";
import GestureDecision from "../gesture/GestureDecision";
import configs from "../../config/Configs";

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

    const config = { gestureDecisionEvent: { duration: 10000, probability: 0.25, bonus: 1 } }
    configs[0] = {...configs[0], ...config};

    const eventManager = new EventManager(ml, gd, configs);
    const numIter = 5;
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < numIter) {
      configs[0].eventProbability = i;
      const event = eventManager.generate();
      //if i is 0, the event is null, otherwise it's populated
      expect(i === 0 && event === null).not.toBe(event);
      event && event.begin();
      eventManager.hasEvent() ? j++ : k++;
      i++;
    }
    expect(j).toBe(numIter - 1);
    expect(k).toBe(1);
    expect(eventManager.hasEvent()).toBe(true);
  });
});
