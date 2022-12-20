import { useEffect, useState } from "react";

export default function useHandsDetection(canvasRef) {

  const [hands, setHands] = useState(null);

  const onHandResults = function (results) {
    //handLandmarks = new Array(126).fill(-1);

    if (results.multiHandLandmarks) {
      //const canvasElement = canvasRef.current;
      const canvasCtx = canvasRef.current.getContext("2d");

      for (const [
        hand_idx,
        landmarks,
      ] of results.multiHandLandmarks.entries()) {
        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        window.drawLandmarks(canvasCtx, landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });

        //multiHandedness[0,1].label "Left / Right"
        //multiHandLandmarks[ {x,y,z..}] //30 * 21 * 2 hands -> 126
        const hand = results.multiHandedness[hand_idx];
        console.log("HAND", hand_idx, hand.label);

        //updateHandLandmarks(hand.label, landmarks, handLandmarks);
      }

      //console.log("HAND", handLandmarks);
    }
    //canvasCtx.restore();
  };

  useEffect(() => {
    console.log("[HandsDetection] useEffect");

    const hands = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      selfieMode: true,
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onHandResults);

    setHands(hands);
  }, []);

  return hands;
}
