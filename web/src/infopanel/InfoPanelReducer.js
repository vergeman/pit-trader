import Message from "./Message.js";
import { OrderType } from "../engine/Order.ts";
import { EventType } from "../player/Event.ts";

export function activeTabReducer(activeTab, action) {
  switch (action.type) {
    case "select":
      activeTab = action.value;
      return activeTab;
    default: {
      throw new Error("action doesn't exist", action);
    }
  }
}

const populateTemplateString = (template, vars) => {
  for (let i = 1; i <= vars.length; i++) {
    template = template.replaceAll(`\$\{${i}\}`, vars[i - 1]);
  }
  return template;
};

export function messagesReducer(messages, action) {
  console.log("[messagesReducer]", action);

  let text;
  let transaction;
  let order;
  switch (action.type) {
    case Message.SetPrice:
    case Message.SetQty:
    case Message.CancelGesture:
      text = populateTemplateString(action.type, [action.value]);
      return [{ time: new Date(), text }, ...messages];
    case Message.CancelOrder:
      order = action.value;
      text = populateTemplateString(action.type, [order.qty, order.price]);
      return [{ time: new Date(), text }, ...messages];
    case Message.OrderSubmitted:
      order = action.value;
      const orderType = order.orderType;
      const qty =
        order.orderType === OrderType.Limit
          ? order.qty + order.qtyFilled
          : order.qtyFilled;
      const messageType =
        orderType === OrderType.Limit
          ? qty > 0
            ? Message.BuyLimitOrder
            : Message.SellLimitOrder
          : qty > 0
          ? Message.BuyMarketOrder
          : Message.SellMarketOrder;
      text = populateTemplateString(messageType, [qty, order.price]);
      return [{ time: new Date(), text }, ...messages];

    case Message.FillLimit:
    case Message.FillMarket:
      transaction = action.value.transaction;
      //order = action.value.order;

      text = populateTemplateString(action.type, [
        -transaction.qty,
        transaction.price,
        transaction.orderQty,
      ]);
      return [{ time: new Date(), text }, ...messages];

    case Message.OrderFilled:
      order = action.value;
      text = populateTemplateString(action.type, [
        order.qtyFilled,
        order.priceFilled().toFixed(1)
      ]);
      return [{ time: new Date(), text }, ...messages];

    case Message.Restart:
      return [];

    case Message.ErrorSubmitOrder:
      const errObj = action.value;
      const errCause = JSON.stringify(errObj.cause);
      text = `${errObj.message}`;
    return [{ time: new Date(), text, type: Message.ErrorSubmitOrder }, ...messages];

    case Message.NewsEvent:
      const event = action.value;
      text = event.msg;
      const time = new Date();
      const endTime = new Date(time);
      endTime.setMilliseconds(time.getMilliseconds() + (event.duration || 0));

      return [{ time, endTime, text, type: Message.NewsEvent }, ...messages];

    case "test":
      text = "Message";
      return [{ time: new Date(), text }, ...messages];
  }

  console.error("action not detected", action);
  return messages;
}


export function gestureDecisionEventReducer(gestureDecisionEvent, action) {

  //TODO: these should be reducer-specific events, but we don't seem to have any
  //at the moment
  if (action.type !== EventType.GESTUREDECISION) return null;

  console.log("[gestureDecisionEventReducer]", action);

  gestureDecisionEvent = action.value;

  return gestureDecisionEvent;
}
