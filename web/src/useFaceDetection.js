import { useState, useEffect } from "react";

export default function useFaceDetection(canvasRef, landmarks) {
  const [faceDetection, setFaceDetection] = useState(null);

  const onFaceResults = function (results) {
    // Draw the overlays.
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasRef.current.getContext("2d");

    //clears previous render
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    //draws 'video'
    /*
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height
    );
    */

    //RESET
    landmarks.resetFaceLandmarks();

    if (results.detections.length > 0) {
      window.drawRectangle(canvasCtx, results.detections[0].boundingBox, {
        color: "blue",
        lineWidth: 4,
        fillColor: "#00000000",
      });

      //NB: landmarks order for facedetection in FaceKeypoint order left/right
      //seem inverted - selfie mode maybe?
      window.drawLandmarks(canvasCtx, results.detections[0].landmarks, {
        color: "red",
        radius: 5,
      });

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

    setFaceDetection(_faceDetection);
  }, []);

  useEffect( () => {
    console.log("[FaceDetection] useEffect landmarks", faceDetection);
    if (faceDetection) {
      faceDetection.onResults(onFaceResults);
    }
  }, [landmarks]);

  return faceDetection;
}
