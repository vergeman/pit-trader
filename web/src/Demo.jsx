import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from './GesturesPanel.jsx';

export default function Demo() {

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

  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera landmarks={landmarks}
              classifier={classifier}
              setGestureData={setGestureData} />
      <GesturesPanel results={gestureData} />
    </div>
  );
}
