import { memo, useRef, useEffect, useState } from "react";
import useCamera from "./useCamera.js";

function Camera(props) {
  const [width, setWidth] = useState(props.width);
  const [height, setHeight] = useState(props.height);

  const videoCanvasRef = useRef(null);
  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useCamera(props.isActive, videoRef, controlRef, canvasRef, props.calcGesture);

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

  console.log("[Camera] render");

  return (
    <div className="video-canvas" ref={videoCanvasRef} onResize={handleResize}>
      <div className="input-output">
        <video ref={videoRef} className="input_video"></video>
        <canvas
          ref={canvasRef}
          className={["output_canvas", props.isVisible ? "" : "d-none"].join(
            " "
          )}
          width={`${width}px`}
          height={`${height}px`}
        ></canvas>
      </div>

      <div ref={controlRef} className="control-panel"></div>
    </div>
  );
}

export default memo(Camera);
