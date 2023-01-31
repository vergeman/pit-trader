import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Landmarks from "./Landmarks.js";
import Classifier from "./Classifier.js";
import Camera from "./Camera.jsx";
import GesturesPanel from './GesturesPanel.jsx';
import MatchingEngine from "./engine/MatchingEngine";
import MatchingEngineView from "./MatchingEngineView.jsx";
import Player from "./player/Player";

export default function Demo() {

  const [gestureData, setGestureData] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [classifier, setClassifier] = useState(null);
  const [me, setMe] = useState(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    console.log("[Demo.jsx]: useEffect init");
    const landmarks = new Landmarks();
    const classifier = new Classifier(landmarks);
    const me = new MatchingEngine();
    const player = new Player("test", true);

    setLandmarks(landmarks);
    setClassifier(classifier);
    setMe(me);
    setPlayer(player);

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
      <MatchingEngineView me={me} player={player} gestureData={gestureData}/>
    </div>
  );
}
