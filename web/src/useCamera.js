import { useState, useEffect } from "react";
import useControl from "./useControl.js";

export default function useCamera(
  videoRef,
  controlRef,
  faceDetection,
  hands,
  classifier,
  setGestureData
) {
  const { control, fpsControl } = useControl(controlRef);
  const [camera, setCamera] = useState(null);

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

    if (faceDetection) {
      await faceDetection.send({ image: videoRef.current });
    }

    if (hands) {
      await hands.send({ image: videoRef.current });
    }

    if (classifier) {
      const res = await classifier.classify();

      //NOTE: minimize renders? - wait for change
      //if (res && res.arg !==_arg) {
      //_arg = res.arg;
      //fpsControl -i secs
      //console.log("RES", res);
      //at this point only want "valid", filtered results to trigger render
      setGestureData(res);
      //}
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
    console.log(
      !!(faceDetection && hands && classifier),
      faceDetection,
      hands,
      classifier
    );

    if (faceDetection && hands && classifier) {
      const _camera = new window.Camera(videoRef.current, {
        onFrame,
        width: 640,
        height: 480,
      });

      setCamera(_camera);
      _camera.start();

      return () => {
        console.log("[Camera] useEffect cleanup");
        if (_camera) {
          _camera.stop();
        }
      };
    }
  }, [faceDetection, hands, classifier]);

  return camera;
}
