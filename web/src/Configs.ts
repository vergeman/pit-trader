
import _configs from "./configs.json";

export interface Config {
  positionLimit: number,
  warnPositionLimit: number,
  maxOrderLimit: number,
  tick: number,
  limitPnL: number, //game over PnL
  levelPnL: number | string, //next level PnL
  gestureDecisionEvent: {
    bonus: number,
    duration: number,
    probability: number,
  }
}

export type Configs = Config[];

const configs: Configs = _configs;
export default configs;
