import _configs from "./configs.json";

/*
 * increased levels give larger positions and p&l loss limits to acclimate the
 * player. Ensures they don't quickly lose by slinging unreasonable size.
 *
 * Scale loss P&L slowly for difficulty
 *
 * NB: These are best guesses meant to be tuned in configs.json.
 *
 *
 * #  | Position Limit | Next Level P&L | Loss P&L |
 * --------------------------------------------------
 * 1  |       20       |     10000      |   -3000  |
 * 2  |       30       |     25000      |   -6000  |
 * 3  |       50       |     75000      |  -10000  |
 * 4  |       75       |    125000      |  -20000  |
 * 5  |      100       |    250000      |  -50000  |
 * 6  |      125       |    500000      |  -50000  |
 * 7  |      150       |    750000      |  -50000  |
 * 8  |      175       |   1000000      |  -75000  |
 * 9  |      200       |       INF      |  -75000  |
 *
 * warn at ~80% positionLimit
 * maxOrder 2x positionLimit
 * qtyMax: ~1/3 positionLimit
 *
 * bonus: 2.5% of next level pnl (this is multiplied by quantity); max at .025 *
 * 175000.
 */

export interface Config {
  positionLimit: number,
  warnPositionLimit: number,
  maxOrderLimit: number,     //maxOrderLimit: # concurrent working orders: need a
                             //limit to prevent squatting a range with large
                             //blocks of orders

  qtyMax: number,            //limit for NPC qtyMax
  tick: number,
  limitPnL: number,          //game over PnL
  levelPnL: number | string, //next level PnL
  eventProbability: number,  //likelihood of generating any Event;
                             //GestureDecisionEvent: specific probability below;
                             //News isremaining (1-GDE prob)
  gestureDecisionEvent: {
    bonus: number,
    duration: number,
    probability: number,
  }
}

export type Configs = Config[];

const configs: Configs = _configs;
export default configs;
