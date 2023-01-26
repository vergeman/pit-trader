import { GestureType } from "./Gesture.ts";

//TODO: change to enum
class INPUT_STATE {
  static IDLE = 1;
  static PENDING = 2;
  static LOCKED = 3;
}

const TIMEOUT = 750;
class NumberSM {
  //arg, probs
  constructor(gestureType, onFinalTimeout) {
    this.onFinalTimeout = onFinalTimeout; //cb function when 'final' value is determined
    this.gestureType = gestureType;

    this.inputState = INPUT_STATE.IDLE; // or class
    this._inputState = this.inputState;
    this.startTime = null;

    this.digit_length = 0;
    this.gestureValue = null;
    this._gestureValue = null;
    this.value = 0;

    this.gestureFinals = [];
  }

  //TODO: replace implementation with requestAnimationFrame
  setTimer() {
    //"FINAL"
    this.timer = setTimeout(() => {
      console.log("[NumberSM] FINAL", this);
      this.onFinalTimeout(this.value);
      this.resetValues();
      this.inputState = INPUT_STATE.LOCKED;
    }, TIMEOUT);
  }

  resetAll() {
    this.resetValues();
    this.resetTimer();
  }

  resetValues() {
    this.value = 0;
    this.digit_length = 0;
    this.gestureValue = null;
    this._gestureValue = null;
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  //keep simple - work for just compound number (not qty or price)
  //ex: 72
  update(gesture) {
    if (gesture === null) return null;

    const gestureValue = gesture.value;
    const digit_length = gesture.digit_length();

    if (this.gestureType !== gesture.type) return null;

    console.log(
      `[NumberSM] ${this.gestureType} update():`,
      this.inputState,
      gestureValue,
      digit_length
    );

    //post submit
    //locked until detect null gesture
    //right now only gestureValue === null
    if (this.inputState === INPUT_STATE.LOCKED) {
      if (gestureValue === null) {
        this.inputState = INPUT_STATE.IDLE;
      }
    }

    //"start"
    if (this.inputState === INPUT_STATE.IDLE) {
      if (gestureValue !== null) {
        this.inputState = INPUT_STATE.PENDING;
      }
    }

    if (this.inputState === INPUT_STATE.PENDING && gestureValue !== null) {
      //replace
      if (digit_length === this.digit_length) {
        if (this.value !== gestureValue) {
          this.value -= this._gestureValue;
          this.value += gestureValue;
        }
      }

      //reset
      if (digit_length > this.digit_length) {
        this.value = gestureValue;
        this.resetTimer();
        this.setTimer(TIMEOUT);
      }

      //smaller digits, add
      if (digit_length < this.digit_length) {
        //add
        this.value = this.value + gestureValue;
        this.resetTimer();
        this.setTimer(TIMEOUT);
      }

      this._gestureValue = gestureValue;
      this.digit_length = digit_length;
    }
  }
}

export { INPUT_STATE, NumberSM };
export { NumberSM as default };
