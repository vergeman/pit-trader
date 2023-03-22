import { useEffect, useState } from "react";

export default function useSelfieDetection(canvasRef, landmarks) {
  const [selfieSegmentation, setSelfieSegmentation] = useState(null);


  const drawing = new Image();
  drawing.src = "19_FullFront.png";

  const drawing2 = new Image();
  drawing2.src = "432_FullFront.png";

  const onSelfieResults = function (results) {
    const canvasCtx = canvasRef.current.getContext("2d");
    //drawing here is entirely overwritten by webcam - doesn't show
    // canvasCtx.drawImage(drawing, 100, 0);
    // canvasCtx.drawImage(drawing2, 200, 0);

    canvasCtx.save();

    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    //drawing here only shows if in segmentationMask
    // canvasCtx.drawImage(drawing, 100, 0);
    //canvasCtx.drawImage(drawing2, 200, 0);

    //canvasCtx.globalCompositeOperation = 'destination-in';  //correct - canvas as transparency
    canvasCtx.globalCompositeOperation = "destination-atop"; //correct - cropped canvas

    canvasCtx.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    //drawing here borks
    // canvasCtx.drawImage(drawing, 100, 0);
    // canvasCtx.drawImage(drawing2, 200, 0);

    canvasCtx.restore();

    //draws over - but we want between
    // canvasCtx.drawImage(drawing, 100, 0);
    // canvasCtx.drawImage(drawing2, 200, 0);

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

    setSelfieSegmentation(selfieSegmentation);
  }, []);

  useEffect(() => {
    console.log("[SelfieDetection] useEffect");
    if (selfieSegmentation) {
      selfieSegmentation.onResults(onSelfieResults);
    }
  }, [landmarks]);

  return selfieSegmentation;
}
