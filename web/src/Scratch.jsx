import { useEffect, useState } from "react";

export default function Scratch(props) {
  const d = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, 0.08243870735168457, 0.3272324204444885,
    3.296062232038821e-7, 0.11587709188461304, 0.2649609446525574,
    -0.010733608156442642, 0.12738025188446045, 0.20119965076446533,
    -0.02170146442949772, 0.13692301511764526, 0.1434585452079773,
    -0.030385395511984825, 0.1565452218055725, 0.10842287540435791,
    -0.03992266580462456, 0.07536429166793823, 0.15806376934051514,
    -0.03490304946899414, 0.06413596868515015, 0.07703894376754761,
    -0.04701704904437065, 0.0496293306350708, 0.031381964683532715,
    -0.05240476876497269, 0.03681206703186035, -0.001009911298751831,
    -0.05688896030187607, 0.03942376375198364, 0.1726135015487671,
    -0.0374128557741642, 0.008090049028396606, 0.09009474515914917,
    -0.04902489855885506, -0.013370007276535034, 0.04655855894088745,
    -0.053542546927928925, -0.02887246012687683, 0.016812801361083984,
    -0.05725706368684769, 0.012033134698867798, 0.19919347763061523,
    -0.03908606246113777, -0.022472083568572998, 0.12650775909423828,
    -0.049961891025304794, -0.039518654346466064, 0.08441585302352905,
    -0.05658777803182602, -0.05035647749900818, 0.051334500312805176,
    -0.062176283448934555, -0.006764203310012817, 0.2322888970375061,
    -0.04069233685731888, -0.04757261276245117, 0.20167887210845947,
    -0.05381026118993759, -0.07199111580848694, 0.1782442331314087,
    -0.061005041003227234, -0.09040814638137817, 0.1531672477722168,
    -0.06528844684362411, -0.04684633016586304, -0.07679343223571777,
    0.028765380382537842, -0.07849520444869995, 0, 0, -0.0023369789123535156,
    0.05037200450897217, -0.10711735486984253, -0.07638520002365112,
    0.06266820430755615, -0.08347678184509277, -1, 0, -1, -1, -1, -1, -1, 1, 1,
    1, 1, 1,
  ];

  useEffect(() => {
    async function load() {
      const argMax = (array) => {
        return [].reduce.call(array, (m, c, i, arr) => (c > arr[m] ? i : m), 0);
      };

      const softmax = (arr) => {
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
      };

      //const model_filename = "/onnx_model.onnx";

      //const model_filename = "/onnx_model_DecisionTreeClassifier.onnx" //
      //Mismatched attribute type in 'TreeEnsembleClassifier : nodes_hitrates' ort-wasm.js:25:423

      const model_filename = "/onnx_model_LogisticRegression.onnx";
      //works

      // const model_filename = "/onnx_model_RandomForestClassifier.onnx";
      //Uncaught (in promise) Error: Can't access output tensor data. error code = 1
      //slow to load

      //const model_filename = "/onnx_model_SVC.onnx";
      //works

      console.log("D Len", d.length);
      const session = await window.ort.InferenceSession.create(model_filename);
      console.log("SESSION", session);

      const data = Float64Array.from(d); //len 150
      console.log("Data Len", data.length);

      //ORIG
      // const live = new window.ort.Tensor("float64", data, [data.length]);
      // const results = await session.run({ landmarks: live });
      // const output = results.class.data;

      //NEW
      const live = new window.ort.Tensor("float64", data, [1, data.length]);
      console.log("Live Len", live.size, live);
      let results;
      try {
        results = await session.run({ X: live });
      } catch(e) {
        console.log("ERR", e);
      }
        console.log("RES", results);
      const output = results.probabilities.data;

      let _probs = softmax(output);
      let _argMax = argMax(_probs);


      console.log("PROBS", _probs);
      console.log("argMax", _argMax);
    }

    load();
  }, []);

  return <div>Scratch</div>;
}
