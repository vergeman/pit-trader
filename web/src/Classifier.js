import InputBufferState from "./input/InputBufferState.js";
import EMABuffer from './input/EMABuffer.js';
import GestureBuilder from './input/GestureBuilder.ts';

export default class Classifier {

  constructor(landmarks, inputBufferState) {
    this.session = null;
    this.landmarks = landmarks;
    this.inputBufferState = new InputBufferState();
    this.emaBuffer = new EMABuffer();

    this.gestureBuilder = new GestureBuilder();
    console.log("CLASSIFIER");
  }

  async load(model_filename = './onnx_model.onnx') {

    await this.gestureBuilder.load();

    try {
      this.session = await window.ort.InferenceSession.create(model_filename);
      console.log("SESSION", this.session);
      return this.session;
    } catch(e) {}

  }

  argMax(array) {
    return [].reduce.call(array, (m, c, i, arr) => c > arr[m] ? i : m, 0);
  }

  softmax(arr) {
    return arr.map(function(value,index) {

      const val =  Math.exp(value);

      const sum = arr
            .map( function(y){ return Math.exp(y); } )
            .reduce( function(a,b){ return a+b; });

      return (val/sum);
    });
  }

  async classify() {
    try {

      const data = Float32Array.from(this.landmarks.get());

      const live = new window.ort.Tensor('float32',
                                         data,
                                         [ data.length ]);

      const results = await this.session.run({'landmarks': live});
      const output = results.class.data;
      let probs = this.softmax(output);
      let arg = this.argMax(probs);

      //POST-PROCESS

      //MOVING AVG / WINDOW / FILTER
      //Disabled for now see EMABuffer.js
      //probs = this.emaBuffer.calc(probs, 2);

      let strProbs = Array
        .from(probs)
        .map(p => p.toFixed(4));

      const gestureData = {
        probs: strProbs,
        arg
      };

      //console.log("ARG", this.gestureBuilder.meta[arg]);

      //THRESHOLD super sensitive to reduce noise
      //if too high, can get jumpy on edge and trigger false "finals"
      //e.g. 95/94/95/94 -> triggers final, clear, then another final clear
      //2 executions
      //TODO: lookup the garbage class and set
      if (strProbs.every( prob => prob < .95) ) {
        gestureData.arg = 6;
      }

      gestureData.gesture = this.gestureBuilder.build( gestureData.arg );

      //STATE - should have value now
      this.inputBufferState.update(gestureData);
      gestureData.inputBufferState = this.inputBufferState;
      //res.probBuffer = this.emaBuffer.probBuffer

      return gestureData;

    } catch(e) {
      //err
      console.log("ERR", e);
    }
  }

}