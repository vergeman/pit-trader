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

  FillMarket: "Filled ${1} price: ${2}",
  FillLimit: "Filled ${1} price: ${2}, working ${3}", //partial qty / remaining qty
  OrderFilled: "Order Filled - Qty: ${1}, Price: ${2}", //total qty / price

  Restart: "Restart",
};

export default Message;
