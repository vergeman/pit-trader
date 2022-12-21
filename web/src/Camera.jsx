import { useEffect, useRef } from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";

export default function Camera(props) {
  //TODO: params isActive on/off given keystroke from above

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const hands = useHandsDetection(canvasRef, props.landmarks);
  console.log("FD", faceDetection);
  console.log("HANDS", hands);

  useEffect(() => {
    console.log("useEffect Camera", window.Camera);

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
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
    </div>
  );
}
