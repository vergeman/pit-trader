import { Gesture, GestureAction, GestureType } from "./Gesture";
import InputState from "./InputState";

class ActionSM {
  //arg, probs
  public onFinalTimeout: (action: GestureAction) => void;
  public gestureType: GestureType;
  private timeout: number;
  public inputState: InputState;
  private timer: NodeJS.Timeout | undefined;
  public action: GestureAction;

  constructor(
    gestureType: GestureType,
    onFinalTimeout: (action: GestureAction) => void,
    timeout: number
  ) {
    this.onFinalTimeout = onFinalTimeout; //cb function when 'final' value is determined
    this.gestureType = gestureType;
    this.timeout = timeout;
    this.inputState = InputState.IDLE; // or class
    this.action = GestureAction.NONE;

  }

  //TODO: replace implementation with requestAnimationFrame
  setTimer() {
    //"FINAL"
    this.timer = setTimeout(() => {
      //console.log("[ActionSM] FINAL", this);
      this.onFinalTimeout(this.action);
      this.resetValues();
      this.inputState = InputState.LOCKED;
    }, this.timeout);
  }

  resetAll() {
    this.resetValues();
    this.resetTimer();
  }

  resetValues() {
    this.action = GestureAction.NONE;
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  unlock() {
    if (this.inputState === InputState.LOCKED) {
      this.inputState = InputState.IDLE;
    }
  }

  update(gesture: Gesture) {
    if (gesture === null) return null;
    const action = gesture.action;

    //allow actions and isMarket
    const isMarket =
      gesture.type === GestureType.PRICE &&
      gesture.action === GestureAction.MARKET;

    if (!(isMarket || gesture.type === GestureType.ACTION)) {
      return null;
    }

    if (action === GestureAction.GARBAGE) return null;

    //Cancel: type: Action, Action: Cancel, value = null
    //Market: type: Price, Action: Market, value = null
    //Garbage: type: Action, Action: Garbage, value = null

    //"start"
    if (this.inputState === InputState.IDLE) {
      if (action !== null) {
        this.inputState = InputState.PENDING;
      }
    }

    //action:
    if (this.inputState === InputState.PENDING &&
      this.action !== null) {

      if ([GestureAction.CANCEL, GestureAction.MARKET].includes(action)) {
        this.action = action;
        this.resetTimer();
        this.setTimer(); //timer for Cancel action, onFinalTimeout cb
      }
    }
  }
}

export { InputState, ActionSM };
export { ActionSM as default };
