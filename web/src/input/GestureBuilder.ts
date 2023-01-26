/* GestureMap return gesture types
 * These are coupled with classifier - think of classifier as a pointer
 * and the map/gesture as direct, expanded info
 */

import { Gesture, GestureAction, GestureType } from "./Gesture";

interface IMeta {
  [index: string]: {
    action: string;
    description: string;
    filename: string;
    gestureType: string;
    index: number;
    keypress: string;
    value: number | null;
  };
}

export default class GestureBuilder {
  public meta: IMeta;
  private _garbage_idx: number;

  constructor() {
    this.meta = {};
    this._garbage_idx = -1;
  }

  async load(meta_filename: string = "./meta.json") {
    this.meta = await fetch(meta_filename)
      .then((res) => res.json())
      .catch((e) => {
        console.error("ERR loading meta", e);
        return {};
      });

    //Find Garbage class
    //TODO: enumify
    const class_meta = Object.values(this.meta).find(
      (m) => (m as any).action === GestureAction.Garbage
    );

    this._garbage_idx = (class_meta as any).index;
  }

  get garbage_idx(): number {
    return this._garbage_idx;
  }

  //THRESHOLD super sensitive to reduce noise
  //if too high, can get jumpy on edge and trigger false "finals"
  //e.g. 95/94/95/94 -> triggers final, clear, then another final clear
  //2 executions

  checkGarbageThreshold(
    probs: string[],
    arg: number,
    threshold: number
  ): number {
    if (probs.every((prob: string) => parseFloat(prob) < threshold)) {
      return this.garbage_idx;
    }
    return arg;
  }

  //expand
  //{"0": {"description": "execute market", "filename": "EXECUTE.csv", "index": 0, "keypress": " "},
  // "10": {"description": "offer 4", "filename": "PRICE_OFFER_4.csv", "index": 10, "keypress": "ALT+4"},
  build(argMax: number): Gesture {
    const meta = this.meta[argMax];

    //console.log("META", meta);

    if (!meta) {
      return new Gesture(GestureType.Action, GestureAction.None, null);
    }

    return new Gesture(
      meta.gestureType as GestureType,
      meta.action as GestureAction,
      meta.value
    );
  }
}
