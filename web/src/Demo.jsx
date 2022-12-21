import { Link } from "react-router-dom";
import Camera from './Camera.jsx';
import Landmarks from './Landmarks.js';
export default function Demo() {

  const landmarks = new Landmarks();

  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera landmarks={landmarks} />
    </div>

  );

}