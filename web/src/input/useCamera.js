import { useState, useEffect } from "react";
import useControl from "./useControl.js";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useSelfieDetection from "./useSelfieDetection.js";
import Landmarks from "./Landmarks.js";

export default function useCamera(
  isActive,
  videoRef,
  controlRef,
  canvasRef,
  classifier,
  calcGesture
) {
  const { control, fpsControl } = useControl(controlRef);
  const [camera, setCamera] = useState(null);
  const [landmarks, setLandmarks] = useState(new Landmarks());

  const faceDetection = useFaceDetection(canvasRef, landmarks);
  const handsDetection = useHandsDetection(canvasRef, landmarks);
  const selfieDetection = useSelfieDetection(canvasRef, landmarks);

  const onFrame = async () => {
    if (!(videoRef && videoRef.current)) return;

    if (fpsControl) {
      fpsControl.tick();

      /*
       * Developing at < 30 fps - presumably there are faster machines but that
       * would likely entail rethinking input handling / timings.
       * So we slow it down by throttling a frame.
       *
       * NB: conceptually don't want to drop a frame, as that would speed things
       * up; want consistency.
       */

      const lastFPS = fpsControl.g.slice(-1); //most recent fps rate
      if (lastFPS > 30) {
        await new Promise((resolve) =>
          setTimeout(resolve, (1 / lastFPS) * 1000)
        );
      }
    }

    //NB: this draw order matters, and can yield different results between
    //browsers. Also seems like can't concurrently send promises with these
    //calls
    for (let detection of [selfieDetection, faceDetection, handsDetection]) {
      if (detection) {
        await detection.send({ image: videoRef.current });
      }
    }

    if (classifier) {
      console.log("Data");
      await calcGesture(landmarks);
    }
  };

  /*
   * In dev, index.js has <StrictMode> enabled which can "double render" and
   * cause confusion re: instantiated third party objects and useEffect hooks
   * with dependencies; e.g. _camera reference doubles, which can lead to
   * orphaned instances or ambigious _camera.stop() calls in cleanup.
   */
  useEffect(() => {
    console.log("[Camera] useEffect start");

    if (selfieDetection && faceDetection && handsDetection && classifier) {
      const _camera = new window.Camera(videoRef.current, {
        onFrame,
      });
      setCamera(_camera);

      if (isActive) {
        _camera.start();
      }

      return () => {
        console.log("[Camera] useEffect cleanup");
        if (_camera) {
          _camera.stop();
        }
      };
    }
  }, [selfieDetection, faceDetection, handsDetection, classifier]);
}
