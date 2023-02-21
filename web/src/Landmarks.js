import * as glMatrix from "gl-matrix";
glMatrix.glMatrix.ARRAY_TYPE = Float64Array;

export default class Landmarks {
  constructor() {
    //data
    this.handLandmarks = new Array(126).fill(-1); //x,y,z
    this.faceLandmarks = new Array(12).fill(-1); //x,y
    this.palmOrientations = new Array(2).fill(-1); //t|f
    this.fingersOpens = new Array(10).fill(-1); //t|f * 5 * 2

    this.base_x = 0;
    this.base_y = 0;
  }

  resetHandLandmarks() {
    this.handLandmarks = new Array(126).fill(-1);
  }

  setHandLandmarks(hand, landmarks) {
    let base = 0;

    if (hand === "Right") {
      base = this.handLandmarks.length / 2;
    }

    for (let k = 0; k < landmarks.length; k++) {
      this.handLandmarks[base + 3 * k] = landmarks[k].x - this.base_x;
      this.handLandmarks[base + 3 * k + 1] = landmarks[k].y - this.base_y;
      this.handLandmarks[base + 3 * k + 2] = landmarks[k].z;
    }
  }

  getVec3LandmarksIndex(landmarks, index) {
    return glMatrix.vec3.fromValues(
      landmarks[index].x - this.base_x,
      landmarks[index].y - this.base_y,
      landmarks[index].z
    );
  }

  setPalmOrientations(hand, landmarks) {
    let idx = Number(hand === "Right");
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();
    const direction = glMatrix.vec3.create();
    const norm_direction = glMatrix.vec3.create();

    const pt0 = this.getVec3LandmarksIndex(landmarks, 0);
    const pt5 = this.getVec3LandmarksIndex(landmarks, 5);
    const pt17 = this.getVec3LandmarksIndex(landmarks, 17);

    glMatrix.vec3.subtract(u, pt17, pt0);
    glMatrix.vec3.subtract(v, pt17, pt5);
    glMatrix.vec3.cross(direction, u, v);
    glMatrix.vec3.normalize(norm_direction, direction);

    let c = 1;
    if (hand === "Left") {
      c = -1;
    }

    const orientation = c * norm_direction.at(-1) > 0;
    this.palmOrientations[idx] = Number(orientation);
    //console.log( orientation ? "PALM_FACING" : "PALM BEHIND");
    return this.palmOrientations;
  }

  resetPalmOrientations() {
    this.palmOrientations = new Array(2).fill(-1);
  }

  //TODO
  setFingersOpen(hand, palmOrientations, landmarks) {}

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
    console.log(JSON.stringify(this.get()));
  }
}
