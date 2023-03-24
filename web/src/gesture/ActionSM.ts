import { Gesture, GestureAction, GestureType } from "./Gesture";
import INPUT_STATE from "./Input_State";

class ActionSM {
  //arg, probs
  public onFinalTimeout: (action: GestureAction) => void;
  public gestureType: GestureType;
  private timeout: number;
  public inputState: INPUT_STATE;
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
    this.inputState = INPUT_STATE.IDLE; // or class
    this.action = GestureAction.None;

  }

  //TODO: replace implementation with requestAnimationFrame
  setTimer() {
    //"FINAL"
    this.timer = setTimeout(() => {
      //console.log("[ActionSM] FINAL", this);
      this.onFinalTimeout(this.action);
      this.resetValues();
      this.inputState = INPUT_STATE.LOCKED;
    }, this.timeout);
  }

  resetAll() {
    this.resetValues();
    this.resetTimer();
  }

  resetValues() {
    this.action = GestureAction.None;
  }

  resetTimer() {
    clearTimeout(this.timer);
  }

  unlock() {
    if (this.inputState === INPUT_STATE.LOCKED) {
      this.inputState = INPUT_STATE.IDLE;
    }
  }

  update(gesture: Gesture) {
    if (gesture === null) return null;
    const action = gesture.action;

    //allow actions and isMarket
    const isMarket =
      gesture.type === GestureType.Price &&
      gesture.action === GestureAction.Market;

    if (!(isMarket || gesture.type === GestureType.Action)) {
      return null;
    }

    if (action === GestureAction.Garbage) return null;

    //Cancel: type: Action, Action: Cancel, value = null
    //Market: type: Price, Action: Market, value = null
    //Garbage: type: Action, Action: Garbage, value = null

    //"start"
    if (this.inputState === INPUT_STATE.IDLE) {
      if (action !== null) {
        this.inputState = INPUT_STATE.PENDING;
      }
    }

    //action:
    if (this.inputState === INPUT_STATE.PENDING &&
      this.action !== null) {

      if ([GestureAction.Cancel, GestureAction.Market].includes(action)) {
        this.action = action;
        this.resetTimer();
        this.setTimer(); //timer for Cancel action, onFinalTimeout cb
      }
    }
  }
}

export { INPUT_STATE, ActionSM };
export { ActionSM as default };
