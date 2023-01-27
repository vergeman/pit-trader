import ActionSM from "./ActionSM";
import { Gesture, GestureType, GestureAction } from "./Gesture";
import INPUT_STATE from "./Input_State";

describe("ActionSM", () => {
  it("update() excludes calls to Garbage action", async () => {
    const gesture = new Gesture(GestureType.Action, GestureAction.Garbage, NaN);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.Action, onFinalTimeout, TIMEOUT);

    expect(actionSM.inputState).toBe(INPUT_STATE.IDLE);
    actionSM.update(gesture);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));

    expect(actionSM.inputState).toBe(INPUT_STATE.IDLE);
    expect(actionSM.action).toBe(GestureAction.None);
    expect(onFinalTimeout).toBeCalledTimes(0);
  });

  it("update() handles cancel action", async () => {
    const gesture = new Gesture(GestureType.Action, GestureAction.Cancel, NaN);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.Action, onFinalTimeout, TIMEOUT);
    actionSM.update(gesture);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    expect(actionSM.inputState).toBe(INPUT_STATE.LOCKED);
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(GestureAction.Cancel);
    //resets
    expect(actionSM.action).toBe(GestureAction.None);
  });

  it("update() triggers market order", async () => {
    const gesture = new Gesture(GestureType.Price, GestureAction.Market, NaN);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const actionSM = new ActionSM(GestureType.Action, onFinalTimeout, TIMEOUT);
    actionSM.update(gesture);
    expect(actionSM.action).toBe(GestureAction.Market);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    //NB: resets
    expect(actionSM.action).toBe(GestureAction.None);
    expect(actionSM.inputState).toBe(INPUT_STATE.LOCKED);
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(GestureAction.Market);
  });
});
