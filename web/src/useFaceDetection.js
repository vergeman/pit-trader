import { useState, useEffect } from "react";

export default function useFaceDetection(canvasRef) {

  const [faceDetection, setFaceDetection] = useState(null);

  const onFaceResults = function (results) {
    // Draw the overlays.
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasRef.current.getContext("2d");

    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );

    //RESET
    //faceLandmarks = new Array(12).fill(-1);

    if (results.detections.length > 0) {
      window.drawRectangle(canvasCtx, results.detections[0].boundingBox, {
        color: "blue",
        lineWidth: 4,
        fillColor: "#00000000",
      });

      window.drawLandmarks(canvasCtx, results.detections[0].landmarks, {
        color: "red",
        radius: 5,
      });

      //console.log("FACE", results.detections[0].landmarks);
      //OUTPUT HERE
      //detections[ {landmarks: [ {x,y,z} ] } ]
      //updateFaceLandmarks(null, results.detections[0].landmarks, faceLandmarks);
    }
  };

  useEffect(() => {
    console.log("[FaceDetection] useEffect");

    const faceDetection = new window.FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
      },
    });

    faceDetection.setOptions({
      selfieMode: true,
      model: "short",
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults(onFaceResults);

    setFaceDetection(faceDetection);
  }, []);

  return faceDetection;
}
