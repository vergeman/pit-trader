import { useEffect, useState } from "react";

export default function useHandsDetection(canvasRef, landmarks) {
  const [hands, setHands] = useState(null);

  const onHandResults = function (results) {
    landmarks.resetHandLandmarks();
    landmarks.resetPalmOrientations();
    landmarks.resetFingersOpen();

    if (results.multiHandLandmarks) {
      const canvasCtx = canvasRef.current.getContext("2d");

      let i=0;
      for (const [
        hand_idx,
        _landmarks,
      ] of results.multiHandLandmarks.entries()) {
        //canvasCtx.save();

        //lines
        window.drawConnectors(canvasCtx, _landmarks, window.HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });

        //nodes
        window.drawLandmarks(canvasCtx, _landmarks, {
          color: "#FF0000",
          lineWidth: 2,
        });

        //canvasCtx.restore();
        //if (i == 0) {
        //{ _type: "Action", _action: "Garbage", _value: null, _prob: "0.0000" }
        //Object { _type: "Price", _action: "Buy", _value: 1, _prob: "0.9537" }
        //Object { _type: "Qty", _action: "Buy", _value: 3, _prob: "0.9786" }

        if (landmarks.gesture) {

          let minX = _landmarks[0].x;
          let minY = _landmarks[0].y;
          let maxX = _landmarks[0].x;
          let maxY = _landmarks[0].y;

          for (let i = 0; i < _landmarks.length; i++) {
            minX = Math.min(_landmarks[i].x, minX);
            minY = Math.min(_landmarks[i].y, minY);
            maxX = Math.max(_landmarks[i].x, maxX);
            maxY = Math.max(_landmarks[i].y, maxY);
          }

          console.log("calc", minX, minY, maxX - minX, maxY - minY );

          //boundingbox
          //canvasCtx.fillRect(minX * 640, minY * 480, (maxX-minX)*640, (maxY-minY) * 480); //x,y, width, height

          //text
          //canvasCtx.fillText(text, _landmarks[0].x * 636, _landmarks[0].y * 477);

          //above

          canvasCtx.font = "48px serif";

          const text = landmarks.gesture.action == "Garbage" ? "" : `${landmarks.gesture.action} ${landmarks.gesture.value}`;

          //text height
          const textMetrics = canvasCtx.measureText(text);
          const width = textMetrics.width;
          const height = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

          canvasCtx.fillStyle = "rgba(0, 0, 0, 1)";
          canvasCtx.fillRect(minX * 640, minY * 480, width, -height );

          canvasCtx.fillStyle = "#fafafa";
          canvasCtx.fillText(text, minX * 640, minY * 480);

          //x,y, width, height
        }


      //}
        i++;

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
    //canvasCtx.restore();
  };

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
  }, [landmarks]);

  return hands;
}
