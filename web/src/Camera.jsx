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
    <div className="video-canvas">
      <div className="input-output">
        <video ref={videoRef} className="input_video"></video>
        <canvas
          ref={canvasRef}
          className="output_canvas"
          width="640px"
          height="480px"
        ></canvas>
      </div>

      <div ref={controlRef} className="control-panel"></div>
    </div>
  );
}

export default Camera;
