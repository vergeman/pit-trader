import { useEffect, useRef } from "react";
import React from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useControl from "./useControl.js";

function Camera(props) {
  //TODO: params isActive on/off given keystroke from above
  //TODO: promises in onFrame could optimize - Promise.all doesn't work

  const controlRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const {control, fpsControl } = useControl(controlRef);
  const faceDetection = useFaceDetection(canvasRef, props.landmarks);
  const hands = useHandsDetection(canvasRef, props.landmarks);
  //console.log("FD", faceDetection);
  //console.log("HANDS", hands);

  useEffect(() => {
    console.log("Camera [useEffect]", window.Camera);
    //console.log("control", control);
    let _arg = null;

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {

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

          const lastFPS = fpsControl.g.slice(-1);  //most recent fps rate
          if ( lastFPS > 30) {
            await new Promise(resolve => setTimeout(resolve, 1/lastFPS * 1000) );
          }
        }

        if (faceDetection) {
          await faceDetection.send({ image: videoRef.current });
        }

        if (hands) {
          await hands.send({ image: videoRef.current });
        }

        if (props.classifier) {

          const res = await props.classifier.classify();

          //NOTE: minimize renders? - wait for change
          //if (res && res.arg !==_arg) {
          //_arg = res.arg;
          //fpsControl -i secs

          //at this point only want "valid", filtered results to trigger render
          //props.setGestureData(res);
          props.gestureReducer({type: 'update', res});
          //}

        }

        //await props.landmarks.print()
      },
      width: 640,
      height: 480,

      /*
      width: 1280,
      height: 720,
      */
    });

    camera.start();
  }, [props.classifier, faceDetection, hands]);

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

export default React.memo(Camera);