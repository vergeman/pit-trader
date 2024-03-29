import { useEffect, useState, useCallback } from "react";

export default function useHandsDetection(canvasRef, landmarks) {
  const [hands, setHands] = useState(null);

  const onHandResults = useCallback(
    (results) => {
      landmarks.resetHandLandmarks();
      landmarks.resetPalmOrientations();
      landmarks.resetFingersOpen();

      if (results.multiHandLandmarks) {
        const canvasCtx = canvasRef.current.getContext("2d");

        for (const [
          hand_idx,
          _landmarks,
        ] of results.multiHandLandmarks.entries()) {
          if (landmarks.recognizedGesture) {
            canvasCtx.shadowColor = "#00FF00";
            canvasCtx.shadowBlur = 16;

            //"connectors" -> Lines
            //params: color, lineWidth
            window.drawConnectors(
              canvasCtx,
              _landmarks,
              window.HAND_CONNECTIONS,
              {
                color: "#00FF00",
                lineWidth: 2,
              }
            );

            //"landmarks" -> dots
            //params: fillColor, color, lineWidth, radius: 3 default
            window.drawLandmarks(canvasCtx, _landmarks, {
              color: "#FF3300",
              radius: 1,
            });
          }

          //multiHandedness[0,1].label "Left / Right"
          //multiHandLandmarks[ {x,y,z..}] //30 * 21 * 2 hands -> 126
          const hand = results.multiHandedness[hand_idx];

          landmarks.setHandLandmarks(hand.label, _landmarks);

          const palmOrientations = landmarks.setPalmOrientations(
            hand.label,
            _landmarks
          );

          landmarks.setFingersOpen(hand.label, palmOrientations, _landmarks);
        }
      }
    },
    [landmarks, canvasRef]
  );

  useEffect(() => {
    console.log("[HandsDetection] useEffect init");

    const _hands = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    _hands.setOptions({
      selfieMode: true,
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    _hands.onResults(onHandResults);
    setHands(_hands);
  }, [onHandResults]);

  return hands;
}
