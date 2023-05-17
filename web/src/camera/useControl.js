import { useState, useEffect } from "react";
import { useGameContext } from "../components/GameContext.jsx";

export default function useControl(controlRef) {
  const gameContext = useGameContext();
  const [control, setControl] = useState(null);
  const [fpsControl, setFPSControl] = useState(null);

  useEffect(() => {
    console.log("[controlFPS] useEffect");

    //show only on debug
    if (!gameContext.isDebug) return;

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
