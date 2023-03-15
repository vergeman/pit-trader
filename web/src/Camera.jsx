import { useRef, useEffect, useState } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useSelfieDetection from "./useSelfieDetection.js";
import useCamera from "./useCamera.js";

function Camera(props) {
  const [width, setWidth] = useState("640px");
  const [height, setHeight] = useState("480px");

  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const handsDetection = useHandsDetection(canvasRef, props.landmarks);
  const selfieDetection = useSelfieDetection(canvasRef, props.landmarks);

  const camera = useCamera(
    videoRef,
    controlRef,
    faceDetection,
    handsDetection,
    selfieDetection,
    props.classifier,
    props.setGestureData
  );

  const handleResize = (e) => {
    console.log("resize", e);
    console.log(window.innerWidth, window.innerHeight);
    /*
     * TODO: calc 640 / 480 or device dependent aspect ratio
     * possible debounce on resize
     * take min of default dim vs innerWidth/innerHeight aspect ratio
     * setWidth(), setHeight()
     */
  };

  useEffect( () => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const canvasStyle = {
    width, height
  };

  return (
    <div className="video-canvas" style={canvasStyle} onResize={handleResize}>
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
