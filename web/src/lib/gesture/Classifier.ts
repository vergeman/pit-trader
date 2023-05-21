import Landmarks from "../../camera/Landmarks";
import EMABuffer from "./EMABuffer";
declare global {
  interface Window {
    ort: any; //loaded by onnx library
  }
}

export default class Classifier {
  public session: any;
  public emaBuffer: EMABuffer;
  public garbage_idx: number | null;
  public model_index: number;
  public MODELS: string[];

  constructor() {
    this.session = null;
    this.emaBuffer = new EMABuffer();
    this.garbage_idx = null;
    this.model_index = 1;
    this.MODELS = [
      "./model_onnx_NN.onnx",
      "./model_onnx_LogisticRegression.onnx",
      "./model_onnx_SVC.onnx",
    ];
    console.log("CLASSIFIER");
  }

  async load(garbage_idx: number) {
    this.garbage_idx = garbage_idx;

    //set running model
    const model_filename = this.MODELS[this.model_index];

    try {
      this.session = await window.ort.InferenceSession.create(model_filename);
      console.log("SESSION", this.session);
      return this.session;
    } catch (e) {}
  }

  //NB: m is the accumulator - which in this case stashes the 'm' = max index
  //(if a larger number 'c' is encountered, that index 'i' becomes m)
  argMax(array: string[]): number | unknown {
    return [].reduce.call(
      array,
      (m: unknown, c: number, i: number, arr: number[]) =>
        c > arr[m as number] ? i : m,
      0
    );
  }

  softmax(arr: number[]) {
    return arr.map(function (value) {
      const val = Math.exp(value);

      const sum = arr
        .map(function (y) {
          return Math.exp(y);
        })
        .reduce(function (a, b) {
          return a + b;
        });

      return val / sum;
    });
  }

  checkGarbageThreshold(
    probs: string[],
    arg: number | unknown,
    threshold: number
  ): number | unknown | null {
    if (probs.every((prob: string) => parseFloat(prob) < threshold)) {
      return this.garbage_idx;
    }
    return arg;
  }

  async classify(landmarks: Landmarks) {
    try {
      const data = Float64Array.from(landmarks.get());

      let live;
      let results;
      let output;
      let probs;
      let argMax: number | unknown | null;

      // toggle models in load()
      if (this.model_index === 0) {
        live = new window.ort.Tensor("float64", data, [data.length]);
        results = await this.session.run({ landmarks: live });
        output = results.class.data;

        probs = this.softmax(output);
        probs = Array.from(probs).map((p) => p.toFixed(4));
        argMax = this.argMax(probs);
        argMax = this.checkGarbageThreshold(probs, argMax, 0.95);
      } else {
        //scilkit model exports have (slightly) different input/output
        //expectations;
        live = new window.ort.Tensor("float64", data, [1, data.length]);
        results = await this.session.run({ X: live });
        output = results.probabilities.data as number[];

        //scikit already applies softmax in pred_proba
        probs = Array.from(output).map((p: number) => p.toFixed(4));
        argMax = this.argMax(probs);

        //lower tolerance
        argMax = this.checkGarbageThreshold(probs, argMax, 0.41);
      }

      //POST-PROCESS
      // console.log("Probs", probs);
      // console.log("argMax", argMax);
      //MOVING AVG / WINDOW / FILTER
      //Disabled for now see EMABuffer.js
      //probs = this.emaBuffer.calc(probs, 2);

      return {
        probs,
        argMax,
      };
    } catch (e) {
      //err
      console.log("ERR", e);
    }

    return {};
  }
}
