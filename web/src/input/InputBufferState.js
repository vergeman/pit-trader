class INPUT_STATE {
  static IDLE = 1;
  static PENDING = 2;
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
  }

  getGestureValue(classNum) {
    const vals = {
      0: 1,
      1: 2,
      2: 3,
      3: 10,
      4: 70,
      5: 100,
      6: null,
      null: null,
    };

    return vals[parseInt(classNum)];
  }

  setTimer() {
    this.timer = setTimeout(() => {
      console.log("FINAL", this.value);

      this.value = 0;
      this.digit_length = 0;
      this.gestureValue = null;
      this._gestureValue = null;

      this.inputState = INPUT_STATE.IDLE;
    }, TIMEOUT);
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  //keep simple - work for just compound number (not qty or price)
  //ex: 72
  update(gestureData) {
    if (gestureData === null) return;

    const gestureValue = this.getGestureValue(gestureData.arg);
    const digit_length =
      gestureValue === null ? 0 : String(gestureValue).length;

    console.log(this.inputState, gestureValue, digit_length);

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
