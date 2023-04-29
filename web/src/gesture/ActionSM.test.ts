import ActionSM from "./ActionSM";
import { Gesture, GestureType, GestureAction } from "./Gesture";
import INPUT_STATE from "./Input_State";

describe("ActionSM", () => {
  it("update() excludes calls to Garbage action", async () => {
    const gesture = new Gesture(GestureType.ACTION, GestureAction.GARBAGE, NaN, null);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.ACTION, onFinalTimeout, TIMEOUT);

    expect(actionSM.inputState).toBe(INPUT_STATE.IDLE);
    actionSM.update(gesture);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));

    expect(actionSM.inputState).toBe(INPUT_STATE.IDLE);
    expect(actionSM.action).toBe(GestureAction.NONE);
    expect(onFinalTimeout).toBeCalledTimes(0);
  });

  it("update() handles cancel action", async () => {
    const gesture = new Gesture(GestureType.ACTION, GestureAction.CANCEL, NaN, null);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.ACTION, onFinalTimeout, TIMEOUT);
    actionSM.update(gesture);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    expect(actionSM.inputState).toBe(INPUT_STATE.LOCKED);
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(GestureAction.CANCEL);
    //resets
    expect(actionSM.action).toBe(GestureAction.NONE);
  });

  it("update() triggers market order", async () => {
    const gesture = new Gesture(GestureType.PRICE, GestureAction.MARKET, NaN, null);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.ACTION, onFinalTimeout, TIMEOUT);
    actionSM.update(gesture);
    expect(actionSM.action).toBe(GestureAction.MARKET);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    //NB: resets
    expect(actionSM.action).toBe(GestureAction.NONE);
    expect(actionSM.inputState).toBe(INPUT_STATE.LOCKED);
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(GestureAction.MARKET);
  });
});
