/*
 * Issue with recognition delay
 *
 * Any kind of windowing or smoothing tends to invoke a noticeable latency with
 * gesture recognition - root is the FPS is just too slow with hands.
 *
 * Moving average: value from a low probability to high probability requires 2
 * or 3 high probability frames to pass a threshold e.g from 0 -> .4 -> .99.
 * Even fast rates have a noticeable gesture hold period / delay for the
 * probabilities to "average up" past a threshold.
 * On lower frame rates, compound gestures are extremely frustrating.
 *
 * Similarly, a simple window buffer sequence with majority vote of classes e.g. [1, garbage, 1,...]
 * requires at the same 2,3 "frames" to decide a gesture
 *
 * Current plan is to add more robust "garbage" data class to capture transitional space
 * between gestures.
 */


export default class EMABuffer {

  public probBuffer: number[][];

  constructor() {
    this.probBuffer = []; //{0: [], 1: [], 2: []...}
  }

  EMACalc(mArray : number[], mRange: number): number[] {
    const k = 2 / (mRange + 1);
    // first item is just the same as the first item in the input
    let emaArray = [mArray[0]];
    // for the rest of the items, they are computed with the previous one
    for (let i = 1; i < mArray.length; i++) {
      emaArray.push(mArray[i] * k + emaArray[i - 1] * (1 - k));
    }
    return emaArray;
  }

  calc(probs: number[], N:number=5): number[] {

    for (let i = 0; i < probs.length; i++) {

      //build internal array of arrays
      this.probBuffer[i] = Array.isArray(this.probBuffer[i]) ?
        this.probBuffer[i] :
        [];

      //TODO: change to mod
      this.probBuffer[i].push(probs[i]);

      if (this.probBuffer[i].length > N) {
        this.probBuffer[i].shift();
      }

      //Exp Moving Avg: N = 5
      const calcs = this.EMACalc(this.probBuffer[i], N);
      probs[i] = calcs[ calcs.length -1 ];
    }

    return probs;
  }


}