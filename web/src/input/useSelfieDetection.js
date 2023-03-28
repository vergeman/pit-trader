import { useEffect, useState } from "react";

export default function useSelfieDetection(canvasRef, landmarks) {
  const [selfieSegmentation, setSelfieSegmentation] = useState(null);

  const onSelfieResults = function (results) {
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
  };

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
  }, []);

  return selfieSegmentation;
}
