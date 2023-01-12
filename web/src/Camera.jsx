import { useState, useEffect, useRef } from "react";
import React from "react";
import useFaceDetection from "./useFaceDetection.js";
import useHandsDetection from "./useHandsDetection.js";
import useControl from "./useControl.js";

function Camera(props) {
  //TODO: params isActive on/off given keystroke from above
  //TODO: promises in onFrame could optimize - Promise.all doesn't work

  const controlRef = useRef(null);

  const {control, fpsControl } = useControl(controlRef);
  //console.log("FD", faceDetection);
  //console.log("HANDS", hands);
  return (
    <div>

      <div ref={controlRef} className="control-panel"
           style={{position: 'fixed', top: '0'}}>
      </div>
    </div>
  );
}

export default React.memo(Camera);