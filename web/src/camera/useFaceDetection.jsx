import { useState, useEffect } from "react";

export default function useFaceDetection(canvasRef, landmarks) {
  const [faceDetection, setFaceDetection] = useState(null);

  const onFaceResults = function (results) {
    //RESET Landmarks
    landmarks.resetFaceLandmarks();

    if (results.detections.length > 0) {
      //detections[ {landmarks: [ {x,y,z} ] } ]
      landmarks.setFaceLandmarks(results.detections[0].landmarks);
    }
  };

  useEffect(() => {
    console.log("[FaceDetection] useEffect init");

    const _faceDetection = new window.FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
      },
    });

    _faceDetection.setOptions({
      selfieMode: true,
      model: "short",
      minDetectionConfidence: 0.5,
    });
    _faceDetection.onResults(onFaceResults);
    setFaceDetection(_faceDetection);
  }, [landmarks]);

  return faceDetection;
}
