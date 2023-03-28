import EMABuffer from "./EMABuffer.js";

export default class Classifier {
  constructor() {
    this.session = null;
    this.emaBuffer = new EMABuffer();
    this.garbage_idx = null;
    console.log("CLASSIFIER");
  }

  async load(garbage_idx, model_filename = "./onnx_model.onnx") {
    this.garbage_idx = garbage_idx;

    try {
      this.session = await window.ort.InferenceSession.create(model_filename);
      console.log("SESSION", this.session);
      return this.session;
    } catch (e) {}
  }

  argMax(array) {
    return [].reduce.call(array, (m, c, i, arr) => (c > arr[m] ? i : m), 0);
  }

  softmax(arr) {
    return arr.map(function (value, index) {
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

  checkGarbageThreshold(probs, arg, threshold) {
    if (probs.every((prob) => parseFloat(prob) < threshold)) {
      return this.garbage_idx;
    }
    return arg;
  }

  async classify(landmarks) {
    try {
      const data = Float64Array.from(landmarks.get());

      const live = new window.ort.Tensor("float64", data, [data.length]);

      const results = await this.session.run({ landmarks: live });
      const output = results.class.data;
      let probs = this.softmax(output);
      let argMax = this.argMax(probs);

      //POST-PROCESS

      //MOVING AVG / WINDOW / FILTER
      //Disabled for now see EMABuffer.js
      //probs = this.emaBuffer.calc(probs, 2);

      probs = Array.from(probs).map((p) => p.toFixed(4));

      argMax = this.checkGarbageThreshold(probs, argMax, 0.95);

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
