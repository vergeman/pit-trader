import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Camera from './Camera.jsx';
import Landmarks from './Landmarks.js';
import Classifier from './Classifier.js';

export default function Demo() {

  const landmarks = new Landmarks();
  const classifier = new Classifier(landmarks);
  console.log("Demo.jsx");
  //TODO; defautl garbage class
  const [gestureClass, setGestureClass] = useState(null);

  useEffect(() => {
    console.log("Demo.jsx: useEffect");
    classifier.load().then( async() => {

      const interval = setInterval(async () => {

        const res = await classifier.classify();

        setGestureClass(res);
      }, 250);

      return () => clearInterval(interval);

    })
  }, [])


  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera landmarks={landmarks} />
      <p>{JSON.stringify(gestureClass)}</p>
    </div>

  );

}