import NumberSM from "./NumberSM";
import { Gesture, GestureType, GestureAction } from "./Gesture";
import INPUT_STATE from "./Input_State";

describe("NumberSM", () => {
  it("update() after time out executes callback with resulting value", async () => {
    const gesture = new Gesture(GestureType.QTY, GestureAction.Buy, 3, 1);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const qtySM = new NumberSM(GestureType.QTY, onFinalTimeout, TIMEOUT);
    qtySM.update(gesture);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    expect(onFinalTimeout).toBeCalledWith(3);
  });

  it("update() returns sum of descending gesture values", async () => {
    const gesture100 = new Gesture(GestureType.QTY, GestureAction.Buy, 100, 1);
    const gesture70 = new Gesture(GestureType.QTY, GestureAction.Buy, 70, 1);
    const gesture3 = new Gesture(GestureType.QTY, GestureAction.Buy, 3, 1);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const qtySM = new NumberSM(GestureType.QTY, onFinalTimeout, TIMEOUT);
    qtySM.update(gesture100);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    qtySM.update(gesture70);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    qtySM.update(gesture3);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(173);
    expect(qtySM.inputState).toBe(INPUT_STATE.LOCKED);
  });

  //replace value behavior
  it("update() returns 'replaced' gesture value with same digit length with single callback", async () => {
    const gesture100 = new Gesture(GestureType.QTY, GestureAction.Buy, 100, 1);
    const gesture70 = new Gesture(GestureType.QTY, GestureAction.Buy, 70, 1);
    const gesture80 = new Gesture(GestureType.QTY, GestureAction.Buy, 80, 1);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const qtySM = new NumberSM(GestureType.QTY, onFinalTimeout, TIMEOUT);

    qtySM.update(gesture100);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    qtySM.update(gesture70);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT / 2));
    qtySM.update(gesture80);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));
    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(180);
    expect(qtySM.inputState).toBe(INPUT_STATE.LOCKED);
  });

  //reset value behavior
  it("update() resets value when higher digit gesture is encountered", async () => {
    const gesture70 = new Gesture(GestureType.QTY, GestureAction.Buy, 70, .97);
    const gesture100 = new Gesture(GestureType.QTY, GestureAction.Buy, 100, .98);
    const TIMEOUT = 100;
    const onFinalTimeout = jest.fn();
    const qtySM = new NumberSM(GestureType.QTY, onFinalTimeout, TIMEOUT);

    qtySM.update(gesture70);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT / 2));
    qtySM.update(gesture100);
    expect(qtySM.inputState).toBe(INPUT_STATE.PENDING);
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT + 1));

    expect(onFinalTimeout).toBeCalledTimes(1);
    expect(onFinalTimeout).toBeCalledWith(100);
    expect(qtySM.inputState).toBe(INPUT_STATE.LOCKED);
  });
});
