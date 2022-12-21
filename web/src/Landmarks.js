export default class Landmarks {
  constructor() {
    this.handLandmarks = new Array(126).fill(-1);
    this.faceLandmarks = new Array(12).fill(-1);
    this.data = new Array(138).fill(-1);
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
      this.handLandmarks[base + 3 * k] = landmarks[k].x;
      this.handLandmarks[base + 3 * k + 1] = landmarks[k].y;
      this.handLandmarks[base + 3 * k + 2] = landmarks[k].z;
    }
  }

  resetFaceLandmarks() {
    this.faceLandmarks = new Array(12).fill(-1);
  }

  setFaceLandmarks(landmarks) {
    for (let k = 0; k < landmarks.length; k++) {
      this.faceLandmarks[2 * k] = landmarks[k].x;
      this.faceLandmarks[2 * k + 1] = landmarks[k].y;
    }
  }

  async get() {
    return [].concat(this.handLandmarks, this.faceLandmarks);
  }

  async print() {
    console.log(this.get());
  }
}
