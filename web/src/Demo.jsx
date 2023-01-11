import { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from './GesturesPanel.jsx';

export default function Demo() {

  const reducer = (state, action) => {

    switch (action.type) {
      case 'update':
        console.log('reducer update');
        return {
          ...state,
          res: action.res
        };


      default:
        console.log('reducer default');
        return {
          ...state,
          res: action.res
        };

    }
  };

  const [gestureD, dispatch] = useReducer(reducer, null);
  const [gestureData, setGestureData] = useState(null);

  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);


  useEffect(() => {
    console.log("[Demo.jsx]: useEffect init");
    const landmarks = new Landmarks();
    const classifier = new Classifier(landmarks);

    setLandmarks(landmarks);
    setClassifier(classifier);

    classifier.load();
  }, []);

  /*
   * TODO: create HOC
   * move Camera component to Wrapper
   * move classifier, landmark to Wrapper
   * pass setGestureclass to Wrapper
   *
   * <Demo>
   *   <GestureData setGesture>
   *      <Camera landmark, classifier>
   */
  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera landmarks={landmarks} classifier={classifier}
              gestureReducer={dispatch}
              setGestureData={setGestureData} />
      <GesturesPanel results={gestureD && gestureD.res} />
    </div>
  );
}
