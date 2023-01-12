import { forwardRef, useRef, useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from './GesturesPanel.jsx';

export default function Demo(props, ref) {
  const videoRef = useRef(null);
  const [gestureData, setGestureData] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);

  useEffect(() => {
    console.log("[Demo.jsx]: useEffect init");
    const landmarks = new Landmarks();
    const classifier = new Classifier(landmarks);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
      },
      width: 640,
      height: 480,
    });
    //props.setHidden(false);
    camera.start();

    setLandmarks(landmarks);
    setClassifier(classifier);

    classifier.load();

    return () => {
      console.log("[Demo] cleanup");
      camera.stop();
      //props.setHidden(true);
    }

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
      <Camera landmarks={landmarks}
              classifier={classifier}
              setGestureData={setGestureData} />
      <GesturesPanel results={gestureData} />
      <video
        ref={videoRef}
        className="input_video"></video>
    </div>
  );
}

//const forwardedRef = forwardRef(Demo);
//export default forwardedRef;
