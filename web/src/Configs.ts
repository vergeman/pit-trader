
import _configs from "./configs.json";

export interface Config {
  positionLimit: number,
  warnPositionLimit: number,
  maxOrderLimit: number,
  tick: number,
  limitPL: number,
  gestureDecisionEvent: {
    bonus: number,
    duration: number,
    probability: number,
  }
}

export type Configs = Config[];

const configs: Configs = _configs;
export default configs;
