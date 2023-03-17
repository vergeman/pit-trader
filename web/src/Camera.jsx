import { useRef, useEffect, useState } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useSelfieDetection from "./useSelfieDetection.js";
import useCamera from "./useCamera.js";

function Camera(props) {
  const [width, setWidth] = useState(props.width);
  const [height, setHeight] = useState(props.height);

  const videoCanvasRef = useRef(null);
  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const handsDetection = useHandsDetection(canvasRef, props.landmarks);
  const selfieDetection = useSelfieDetection(canvasRef, props.landmarks);

  const camera = useCamera(
    props.isActive,
    videoRef,
    controlRef,
    faceDetection,
    handsDetection,
    selfieDetection,
    props.classifier,
    props.setGestureData
  );

  const handleResize = (e) => {
    //TODO: debounce
    const aspect_ratio = props.width / props.height;
    const w = videoCanvasRef.current.clientWidth;
    const h = w / aspect_ratio;
    setWidth(w);
    setHeight(h);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="video-canvas" ref={videoCanvasRef} onResize={handleResize}>
      <div className="input-output">
        <video ref={videoRef} className="input_video"></video>
        <canvas
          ref={canvasRef}
          className="output_canvas"
          width={`${width}px`}
          height={`${height}px`}
        ></canvas>
      </div>

      <div ref={controlRef} className="control-panel"></div>
    </div>
  );
}

export default Camera;
