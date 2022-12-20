import { Link } from "react-router-dom";
import Camera from './Camera.jsx';

export default function Demo() {

  const faceLandmarks = new Array(12).fill(-1);

  return (
    <div className="container">
      <Link to="/">Home</Link>
      <h1>Hello World</h1>
      <Camera />
    </div>

  );

}