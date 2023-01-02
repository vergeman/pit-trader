import { useEffect, useRef } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useControl from "./useControl.js";

export default function Camera(props) {
  //TODO: params isActive on/off given keystroke from above
  //TODO: verify this doesn't re-render
  //TODO: promises in onFrame could optimize - Promise.all doesn't work

  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const {control, fpsControl } = useControl(controlRef);
  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const hands = useHandsDetection(canvasRef, props.landmarks);
  console.log("FD", faceDetection);
  console.log("HANDS", hands);

  useEffect(() => {
    console.log("useEffect Camera", window.Camera);
    //console.log("control", control);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {

        fpsControl.tick();

        await faceDetection.send({ image: videoRef.current });
        await hands.send({ image: videoRef.current });

        //await props.landmarks.print()
      },
      width: 1280,
      height: 720,
    });

    camera.start();
  }, [faceDetection, hands]);

  return (
    <div>
      <video ref={videoRef} className="input_video"></video>
      <canvas
        ref={canvasRef}
        className="output_canvas"
        width="1280px"
        height="720px"
      ></canvas>

      <div ref={controlRef} className="control-panel"
           style={{position: 'fixed', top: '0'}}>
      </div>
    </div>
  );
}
