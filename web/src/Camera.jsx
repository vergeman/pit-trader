import { useRef } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useCamera from "./useCamera.js";

function Camera(props) {
  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const hands = useHandsDetection(canvasRef, props.landmarks);
  const camera = useCamera(
    videoRef,
    controlRef,
    faceDetection,
    hands,
    props.classifier,
    props.setGestureData
  );

  return (
    <div>
      <video ref={videoRef} className="input_video"></video>
      <canvas
        ref={canvasRef}
        className="output_canvas"
        width="1280px"
        height="720px"
      ></canvas>
      <div
        ref={controlRef}
        className="control-panel"
        style={{ position: "fixed", top: "0" }}
      ></div>
    </div>
  );
}

export default Camera;
