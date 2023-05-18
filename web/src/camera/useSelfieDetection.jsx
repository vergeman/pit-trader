import { useEffect, useState, useCallback } from "react";

export default function useSelfieDetection(canvasRef) {
  const [selfieSegmentation, setSelfieSegmentation] = useState(null);

  const onSelfieResults = useCallback(
    (results) => {
      if (!canvasRef.current) return;

      const canvasCtx = canvasRef.current.getContext("2d");

      canvasCtx.save();

      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      //canvasCtx.globalCompositeOperation = 'destination-in';  //correct - canvas as transparency
      canvasCtx.globalCompositeOperation = "destination-atop"; //correct - cropped canvas

      canvasCtx.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      canvasCtx.restore();
    },
    [canvasRef]
  );

  useEffect(() => {
    console.log("[selfieDetection] useEffect init");

    const selfieSegmentation = new window.SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      selfieMode: true,
      modelSelection: 0,
    });
    selfieSegmentation.onResults(onSelfieResults);
    setSelfieSegmentation(selfieSegmentation);
  }, [onSelfieResults]);

  return selfieSegmentation;
}
