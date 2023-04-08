import { GestureAction } from "../gesture/Gesture.ts";
import * as glMatrix from "gl-matrix";
glMatrix.glMatrix.setMatrixArrayType(Float64Array);

export default class Landmarks {
  constructor() {
    //data
    this.handLandmarks = new Array(126).fill(-1); //x,y,z
    this.faceLandmarks = new Array(12).fill(-1); //x,y
    this.palmOrientations = new Array(2).fill(-1); //t|f
    this.fingersOpens = new Array(10).fill(-1); //t|f * 5 * 2

    this.base_x = 0;
    this.base_y = 0;

    this.recognizedGesture = false;
  }

  setRecognizedGesture(gesture) {
    this.recognizedGesture = ![
      GestureAction.None,
      GestureAction.Garbage,
    ].includes(gesture.action);
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

  clip(x, min, max) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
  }

  setFingersOpen(hand, palmOrientations, landmarks) {
    //
    // THUMB
    //
    let idx = Number(hand === "Right");
    const u = glMatrix.vec3.create();
    const v = glMatrix.vec3.create();
    const direction = glMatrix.vec3.create();
    const norm_direction = glMatrix.vec3.create();

    const pt1 = this.getVec3LandmarksIndex(landmarks, 1);
    const pt3 = this.getVec3LandmarksIndex(landmarks, 3);
    const pt4 = this.getVec3LandmarksIndex(landmarks, 4);

    glMatrix.vec3.subtract(u, pt4, pt1);
    glMatrix.vec3.subtract(v, pt4, pt3);
    glMatrix.vec3.cross(direction, u, v);
    glMatrix.vec3.normalize(norm_direction, direction);

    // c = -1 if handedness == "Left" else 1
    let c = 1;
    if (hand === "Left") {
      c = -1;
    }
    // palm_orientation = self.left_palm_orientation if handedness == "Left" else self.right_palm_orientation
    // c = c if palm_orientation[0] > 0 else -c
    if (this.palmOrientations[idx] <= 0 && this.palmOrientations[idx] !== -1) {
      c = -c;
    }

    // fingers_opens[0] = int(c * direction[-1] < 0)
    const thumbOpen = Number(c * norm_direction.at(-1) < 0);
    this.fingersOpens[5 * idx + 0] = thumbOpen;
    //console.log("T", thumbOpen ? "OPEN" : "CLOSED", c * norm_direction.at(-1) < 0);

    //
    // FINGERS
    //
    const FINGER_ANGLE = 15;
    const FINGER_RADIANS = (FINGER_ANGLE * Math.PI) / 180;
    const norm_u = glMatrix.vec3.create();
    const norm_v = glMatrix.vec3.create();
    const out_u = glMatrix.vec3.create();
    const out_v = glMatrix.vec3.create();
    //same points per finger

    for (let i = 0; i < 4; i++) {
      const pt1 = this.getVec3LandmarksIndex(landmarks, 5 + i * 4);
      const pt3 = this.getVec3LandmarksIndex(landmarks, 7 + i * 4);
      const pt4 = this.getVec3LandmarksIndex(landmarks, 8 + i * 4);
      glMatrix.vec3.subtract(u, pt4, pt1);
      glMatrix.vec3.subtract(v, pt4, pt3);
      const dot = glMatrix.vec3.dot(u, v);

      glMatrix.vec3.normalize(norm_u, u);
      glMatrix.vec3.normalize(norm_v, v);
      glMatrix.vec3.div(out_u, u, norm_u);
      glMatrix.vec3.div(out_v, v, norm_v);
      const uv = dot / out_u.at(0) / out_v.at(0);
      const radian = Math.acos(this.clip(uv, -1, 1));

      this.fingersOpens[5 * idx + (i + 1)] = Number(radian < FINGER_RADIANS);
      //console.log("RADIAN", 5 * idx + i + 1, uv, radian, this.fingersOpens[5 * idx + i + 1]);
    }
  }

  resetFingersOpen() {
    this.fingersOpens = new Array(10).fill(-1);
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
    return [].concat(
      this.handLandmarks,
      this.faceLandmarks,
      this.palmOrientations,
      this.fingersOpens
    );
  }

  print() {
    console.log(JSON.stringify(this.get()));
  }
}
