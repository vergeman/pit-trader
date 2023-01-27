
import EMABuffer from "./input/EMABuffer.js";
import GestureBuilder from "./input/GestureBuilder.ts";
import GestureDecision from "./input/GestureDecision.ts";

export default class Classifier {
  constructor(landmarks) {
    this.session = null;
    this.landmarks = landmarks;

    this.emaBuffer = new EMABuffer();

    this.gestureBuilder = new GestureBuilder();
    this.gestureDecision = new GestureDecision();
    console.log("CLASSIFIER");
  }

  async load(model_filename = "./onnx_model.onnx") {
    await this.gestureBuilder.load();

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

  async classify() {
    try {
      const data = Float32Array.from(this.landmarks.get());

      const live = new window.ort.Tensor("float32", data, [data.length]);

      const results = await this.session.run({ landmarks: live });
      const output = results.class.data;
      let probs = this.softmax(output);
      let argMax = this.argMax(probs);

      //POST-PROCESS

      //MOVING AVG / WINDOW / FILTER
      //Disabled for now see EMABuffer.js
      //probs = this.emaBuffer.calc(probs, 2);

      probs = Array.from(probs).map((p) => p.toFixed(4));

      argMax = this.gestureBuilder.checkGarbageThreshold(probs, argMax, 0.95);

      const gesture = this.gestureBuilder.build(argMax);

      //STATE - should have value now
      this.gestureDecision.calc(gesture);


      return {
        probs,
        argMax,
        gesture,
        inputBufferState: {}, //TODO: replace
      };

    } catch (e) {
      //err
      console.log("ERR", e);
    }

    return {};
  }
}
