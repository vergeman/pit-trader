import { Gesture, GestureType } from "./Gesture";
import INPUT_STATE from "./Input_State";

const TIMEOUT = 750;
class NumberSM {
  //arg, probs

  public onFinalTimeout: (value: number) => void;
  public gestureType: GestureType;
  private inputState: INPUT_STATE;
  private timer: NodeJS.Timeout | undefined;
  private digit_length: number;
  private _gestureValue: number;  //previous gestureValue
  private value: number;

  constructor(gestureType: GestureType, onFinalTimeout: (value: number) => void) {
    this.onFinalTimeout = onFinalTimeout; //cb function when 'final' value is determined
    this.gestureType = gestureType;

    this.inputState = INPUT_STATE.IDLE; // or class
    this.timer = undefined;
    this.digit_length = 0;
    this._gestureValue = 0;
    this.value = 0;
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
    this._gestureValue = 0;
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  //keep simple - work for just compound number (not qty or price)
  //ex: 72
  update(gesture: Gesture) {
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
        this.setTimer();
      }

      //smaller digits, add
      if (digit_length < this.digit_length) {
        //add
        this.value = this.value + gestureValue;
        this.resetTimer();
        this.setTimer();
      }

      this._gestureValue = gestureValue;
      this.digit_length = digit_length;
    }
  }
}

export { INPUT_STATE, NumberSM };
export { NumberSM as default };
