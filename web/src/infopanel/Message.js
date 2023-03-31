export const Message = {
  //GestureDecision.ts:
  SetPrice: "Set price: ${1}",
  SetQty: "Set qty: ${1}",
  CancelOrder: "Order ${1} cancelled",
  CancelGesture: "Clearing Order",
  OrderSubmitted: "Order Submitted",

  //handled together, extracted
  SellLimitOrder: "Working ${1} at ${2}", //qty @ price
  BuyLimitOrder: "Working ${2} for ${1}", //price for qty
  SellMarketOrder: "Sold ${1} Market", //qty at Market
  BuyMarketOrder: "Bought ${1} Market",

  OrderFilled: "Order Filled",

  Restart: "Restart",
};

export default Message;
