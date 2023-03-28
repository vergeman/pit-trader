import { useState, useEffect } from "react";

export default function useControl(controlRef) {
  const [control, setControl] = useState(null);
  const [fpsControl, setFPSControl] = useState(null);

  useEffect(() => {
    console.log("[controlFPS] useEffect");

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
