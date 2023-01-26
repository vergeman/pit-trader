import { Gesture, GestureAction, GestureType } from "./Gesture.ts";

//TODO: change to enum
//TODO: extend base class? move INPUT_STATE and TIMEOUT to parent GestureDecision
class INPUT_STATE {
  static IDLE = 1;
  static PENDING = 2;
  static LOCKED = 3;
}

const TIMEOUT = 750;

class ActionSM {
  //arg, probs
  constructor(gestureType, onFinalTimeout) {
    this.onFinalTimeout = onFinalTimeout; //cb function when 'final' value is determined
    this.gestureType = gestureType;
    this.inputState = INPUT_STATE.IDLE; // or class
    this._inputState = this.inputState;
    this.startTime = null;

    this.action = null;
  }

  //TODO: replace implementation with requestAnimationFrame
  setTimer() {
    //"FINAL"
    this.timer = setTimeout(() => {
      console.log("[ActionSM] FINAL", this);
      this.onFinalTimeout(this.action);
      this.resetValues();
      this.inputState = INPUT_STATE.LOCKED;
    }, TIMEOUT);
  }

  resetAll() {
    this.resetValues();
    this.resetTimer();
  }

  resetValues() {
    this.action = null;
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  update(gesture) {
    if (gesture === null) return null;

    //Cancel: type: Action, Action: Cancel, value = null
    //Market: type: Price, Action: Market, value = null
    //Garbage: type: Action, Action: Garbage, value = null
    const action = gesture.action;

    if (action === Gesture.Garbage) return null;
    //console.log(`[ActionSM] ${this.gestureType} update():`, this.action);

    //post submit
    //locked until detect null gesture
    //TODO: might not work once paired with either qty + price + action
    if (this.inputState === INPUT_STATE.LOCKED) {
      if (action === null) {
        this.inputState = INPUT_STATE.IDLE;
      }
    }

    //"start"
    if (this.inputState === INPUT_STATE.IDLE) {
      if (action !== null) {
        this.inputState = INPUT_STATE.PENDING;
      }
    }

    //action:
    if (this.inputState === INPUT_STATE.PENDING && this.action === null) {
      if ([GestureAction.Cancel, GestureAction.Market].includes(action)) {
        this.action = action;
        this.resetTimer();
        this.setTimer(TIMEOUT);
      }
    }
  }
}

export { INPUT_STATE, ActionSM };
export { ActionSM as default };
