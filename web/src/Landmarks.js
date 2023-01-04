export default class Landmarks {
  constructor() {
    //data
    this.handLandmarks = new Array(126).fill(-1);
    this.faceLandmarks = new Array(12).fill(-1);

    this.base_x = 0;
    this.base_y = 0;
  }

  resetHandLandmarks() {
    this.handLandmarks = new Array(126).fill(-1);
  }

  setHandLandmarks(hand, landmarks) {

    let base = 0;

    if (hand === "Right") {
      base = 63;
    }

    for (let k = 0; k < landmarks.length; k++) {
      this.handLandmarks[base + 3 * k] = landmarks[k].x - this.base_x;
      this.handLandmarks[base + 3 * k + 1] = landmarks[k].y - this.base_y;
      this.handLandmarks[base + 3 * k + 2] = landmarks[k].z;
    }
  }

  resetFaceLandmarks() {
    this.faceLandmarks = new Array(12).fill(-1);
  }

  setFaceLandmarks(landmarks) {
    //NOSE_TIP
    this.base_x = landmarks[2].x;
    this.base_y = landmarks[2].y;

    for (let k = 0; k < landmarks.length; k++) {
      this.faceLandmarks[2 * k] = landmarks[k].x - this.base_x;
      this.faceLandmarks[2 * k + 1] = landmarks[k].y - this.base_y;
    }
  }

  get() {
    return [].concat(this.handLandmarks, this.faceLandmarks);
  }

  print() {
    console.log(JSON.stringify( this.get()) );
  }
}
