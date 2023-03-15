import { useRef } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useSelfieDetection from "./useSelfieDetection.js";
import useCamera from "./useCamera.js";

function Camera(props) {
  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const handsDetection = useHandsDetection(canvasRef, props.landmarks);
  const selfieDetection = useSelfieDetection(canvasRef, props.landmarks);

  //TODO: handle onResize
  const width = "640px";
  const height = "480px";

  const camera = useCamera(
    videoRef,
    controlRef,
    faceDetection,
    handsDetection,
    selfieDetection,
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
          width={width}
          height={height}
        ></canvas>
      </div>

      <div ref={controlRef} className="control-panel"></div>
    </div>
  );
}

export default Camera;
