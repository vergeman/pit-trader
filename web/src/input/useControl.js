import { useState, useEffect } from "react";
import { useGlobalContext } from "../GlobalContext.jsx";

export default function useControl(controlRef) {
  const {isDebug} = useGlobalContext();
  const [control, setControl] = useState(null);
  const [fpsControl, setFPSControl] = useState(null);

  useEffect(() => {
    console.log("[controlFPS] useEffect");

    //show only on debug
    if (!isDebug) return;

    const controlsElement = controlRef.current;

    const fpsControl = new window.FPS();

    const control = new window.ControlPanel(controlsElement, {
      selfieMode: true,
    }).add([fpsControl]);

    setControl(control);
    setFPSControl(fpsControl);
  }, [controlRef]);

  return { control, fpsControl };
}
