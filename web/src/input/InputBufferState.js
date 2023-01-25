class INPUT_STATE {
  static IDLE = 1;
  static PENDING = 2;
  static LOCKED = 3;
}

const TIMEOUT = 750;
class InputBufferState {
  //arg, probs
  constructor() {
    this.inputState = INPUT_STATE.IDLE; // or class
    this._inputState = this.inputState;
    this.startTime = null;

    this.gestureData = null;
    this.digit_length = 0;
    this.gestureValue = null;
    this._gestureValue = null;
    this.value = 0;

    this.gestureFinals = [];
  }

  //TODO: replace implementation with requestAnimationFrame
  setTimer() {

    this.timer = setTimeout(() => {
      //TODO: FINAL
      console.log("FINAL", this.value);
      this.gestureFinals.push(this.value);

      this.value = 0;
      this.digit_length = 0;
      this.gestureValue = null;
      this._gestureValue = null;

      //this gets reset to IDLE when a non null gesture is detected
      this.inputState = INPUT_STATE.LOCKED;
    }, TIMEOUT);
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  //keep simple - work for just compound number (not qty or price)
  //ex: 72
  update(gestureData) {
    if (gestureData === null) return null;

    const gesture = gestureData.gesture;
    const gestureValue = gesture.value;
    const digit_length = gesture.digit_length;

    console.log(this.inputState, gestureValue, digit_length);

    //post submit
    //locked until detect null gesture
    if (this.inputState === INPUT_STATE.LOCKED) {
      if (gestureValue === null){
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

    /*


      g = gesture detect

      if IDLE and gesture.NONE

      if IDLE and gesture.CANCEL
      //dispatch cancel any order

      if IDLE and gesture.something
      digit = updateDigit(gesture)
      setState(PENDING)
      startTimer


      if pending

      if digitcompator(digit, gesture).isGreater
      resetDigit(gesture)
      resetValue to digit (xxx, 1xx, ..)
      resetTimer

      if isLess / isEqual
      updateValue


      if PENDING + gesture.cancel








     */
  }
}

export { INPUT_STATE, InputBufferState as default };
