export default class Classifier {

  constructor(landmarks) {
    this.session = null;
    this.landmarks = landmarks;
    console.log("CLASSIFIER");
  }

  async load(filename = './onnx_model.onnx') {
    try {

      this.session = await window.ort.InferenceSession.create(filename);
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
      const probs = this.softmax(output);
      const arg = this.argMax(probs);

      const strProbs = Array
            .from( probs )
            .map(p => p.toFixed(4));

      // console.log("P", strProbs, arg);

      return {
        probs: strProbs,
        arg
      };

    } catch(e) {
      //err
      console.log("ERR", e);
    }
  }
}