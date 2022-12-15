const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

let handLandmarks = new Array(126).fill(-1);;
let faceLandmarks = new Array(12).fill(-1);;
var data = new Array(138).fill(-1);

/*hands*/
function updateHandLandmarks(hand, landmarks, landmarkStore) {
    let base = 0 ;

    if (hand == "Right") {
        base = 63;
    }

    for (let k = 0; k < landmarks.length; k++) {
        landmarkStore[base + 3*k]     = landmarks[k].x;
        landmarkStore[base + 3*k + 1] = landmarks[k].y;
        landmarkStore[base + 3*k + 2] = landmarks[k].z;
    }
}

function updateFaceLandmarks(hand, landmarks, landmarkStore) {

    for (let k = 0; k < landmarks.length; k++) {
        landmarkStore[2*k]     = landmarks[k].x;
        landmarkStore[2*k + 1] = landmarks[k].y;
    }
}

function onHandResults(results) {
  //canvasCtx.save();
  //canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  //canvasCtx.drawImage(
      //results.image, 0, 0, canvasElement.width, canvasElement.height);

    handLandmarks = new Array(126).fill(-1);

    if (results.multiHandLandmarks) {
        //console.log("INIT HAND", handLandmarks);

        for (const [hand_idx, landmarks] of results.multiHandLandmarks.entries() ) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                           {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

            //multiHandedness[0,1].label "Left / Right"
            //multiHandLandmarks[ {x,y,z..}] //3 * 21 * 2 hands -> 126
            const hand = results.multiHandedness[hand_idx];

            //console.log("HAND", hand_idx, hand.label);

            updateHandLandmarks(hand.label, landmarks, handLandmarks);
        }

        //console.log("HAND", handLandmarks);

  }
  //canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  selfieMode: true,
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onHandResults);


/* face */
function onFaceResults(results) {
    // Draw the overlays.
    //canvasCtx.save();
    //canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    faceLandmarks = new Array(12).fill(-1);

    if (results.detections.length > 0) {
        drawRectangle(
            canvasCtx, results.detections[0].boundingBox,
            {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
        drawLandmarks(canvasCtx, results.detections[0].landmarks, {
            color: 'red',
            radius: 5,
        });
        //console.log("FACE", results.detections[0].landmarks);

        //detections[ {landmarks: [ {x,y,z} ] } ]
        updateFaceLandmarks(null, results.detections[0].landmarks, faceLandmarks);
    }
    //canvasCtx.restore();
}

const faceDetection = new FaceDetection({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
}});
faceDetection.setOptions({
    selfieMode: true,
    model: "short",
    minDetectionConfidence: 0.5
});
faceDetection.onResults(onFaceResults);


const testData = async () => {
    //console.log("H", handLandmarks);
    //console.log("F", faceLandmarks);
    data = [].concat(handLandmarks, faceLandmarks);
    //console.log("DATA", data);
};

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceDetection.send({image: videoElement});
        await hands.send({image: videoElement});
        await testData();
  },
  width: 1280,
  height: 720
});

camera.start();
