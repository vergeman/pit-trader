import MatchingEngine from "./MatchingEngine";
import { OrderStatus, OrderType, Order } from "./Order";

// TODO: effect on player - what happens post execute? what do we need

describe("process() basic operations", () => {
  it("adds a limit order to each empty queue", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 101);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(1);
  });

  it("limit orders execute against each other and are removed from queue", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 100); //note: price
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(0);
    expect(me.offers.size()).toEqual(0);
    expect(me.transactionReports[0].qty).toBe(50);
    expect(me.transactionReports[0].price).toBe(100);
  });

  it("heap behavior for queues - self orders so Orders execute at best price", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, -50, 103);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 102);
    //pay 103 will lift the 102 offer
    const o3 = new Order("Player 2", OrderType.Limit, 50, 102);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);
    expect(me.offers.size()).toEqual(1);
    expect(me.offers.peek()).toBe(o1);
    expect(me.transactionReports[0].qty).toBe(50);
    expect(me.transactionReports[0].price).toBe(102);
  });

  it("market order submitted to empty queues are rejected", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Market, 50, 100);
    expect(() => me.process(o1)).toThrow("rejected");
    expect(o1.status).toBe(OrderStatus.Rejected);
  });

  it("market order on larger qty limit order: market order filled, partial fill on limit", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 500, 100);
    const o2 = new Order("Player 2", OrderType.Market, -50, -1);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);
    expect(me.transactionReports[0].qty).toBe(50);
    expect(me.transactionReports[0].price).toBe(100);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(450);
  });

  it("limit order on larger qty limit order: limit order filled, partial fill on existing order", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 500, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -50, 100);
    me.process(o1);
    me.process(o2);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);
    expect(me.transactionReports[0].qty).toBe(50);
    expect(me.transactionReports[0].price).toBe(100);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(450);
  });
});

describe("process() orders fill on multiple orders", () => {
  it("market order on smaller qty limit order - sweeps multiple orders", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Market, -75, -1);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(1);
    expect(me.offers.size()).toEqual(0);
    expect(o1.status).toBe(OrderStatus.Complete);

    //note order of transactions
    expect(me.transactionReports[1].qty).toBe(50);
    expect(me.transactionReports[1].price).toBe(100);
    expect(me.transactionReports[0].qty).toBe(25);
    expect(me.transactionReports[0].price).toBe(99);

    //remainder
    const bid = me.bids.peek();
    expect(bid && bid.qty).toEqual(25);
    expect(bid && bid.price).toEqual(99);
    expect(bid && bid.status).toBe(OrderStatus.Live);
  });

  it("limit order sweep - remainder becomes working limit order", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Limit, -175, 97);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);

    //fills
    expect(o1.qtyFilled).toEqual(50);
    expect(o2.qtyFilled).toEqual(50);
    expect(o1.status).toBe(OrderStatus.Complete);
    expect(o2.status).toBe(OrderStatus.Complete);

    expect(me.transactionReports[1].qty).toBe(50);
    expect(me.transactionReports[1].price).toBe(100);
    expect(me.transactionReports[0].qty).toBe(50);
    expect(me.transactionReports[0].price).toBe(99);

    //remainder
    expect(me.offers.size()).toEqual(1);
    const offer = me.offers.peek();
    expect(offer).toBe(o3);
    expect(offer && offer.qty).toEqual(-75);
    expect(offer && offer.price).toEqual(97);
    expect(offer && offer.status).toBe(OrderStatus.Live);
  });

  //TODO: unsure policy depending on game dynamcis
  it("market order sweep with remainder - no more markets leaves partial fill but is marked as complete", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 50, 99);
    const o3 = new Order("Player 3", OrderType.Market, -175, 97);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(0);

    //fills
    expect(o1.qtyFilled).toEqual(50);
    expect(o2.qtyFilled).toEqual(50);

    //remainder for market order isn't worked
    expect(me.offers.size()).toEqual(0);
    expect(o1.status).toBe(OrderStatus.Complete);
    expect(o2.status).toBe(OrderStatus.Complete);
    expect(o3.status).toBe(OrderStatus.Complete);
  });
});

describe("getSums() display qty summarized bid offers", () => {
  it("getSumBids() / getSumOffers() returns summarized orders from specified collection", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 50, 100);
    const o2 = new Order("Player 2", OrderType.Limit, 25, 100);
    const o3 = new Order("Player 3", OrderType.Limit, 10, 100);
    const o4 = new Order("Player 4", OrderType.Limit, 10, 101);
    const o5 = new Order("Player 5", OrderType.Limit, 10, 101);
    const o6 = new Order("Player 6", OrderType.Limit, -10, 102);

    for (let order of [o1, o2, o3, o4, o5, o6]) {
      me.process(order);
    }

    const { bidMap, bidPriceLabel }: any = me.getSumBids("Player 1");
    expect(bidMap.get(100)).toBe(85);
    expect(bidMap.get(101)).toBe(20);

    const { offerMap, offerPriceLabel } = me.getSumOffers("Player 6");
    expect(offerMap.get(102)).toBe(-10);

    //labels
    expect(Object.keys(bidPriceLabel)).toEqual(["100"]);
    expect(bidPriceLabel["100"]).toBeTruthy();

    expect(Object.keys(offerPriceLabel)).toEqual(["102"]);
    expect(offerPriceLabel["102"]).toBeTruthy();
  });
});

describe("TransactionReports", () => {
  it("lastTraded() reflect last trade", () => {
    const me = new MatchingEngine();
    const o1 = new Order("Player 1", OrderType.Limit, 100, 100);
    const o2 = new Order("Player 2", OrderType.Limit, -150, 99);
    const o3 = new Order("Player 3", OrderType.Limit, 50, 99);

    me.process(o1);
    expect(me.transactionReports.length).toBe(0);
    me.process(o2);
    expect(me.transactionReports.length).toBe(1);
    let last = me.lastTraded();
    expect(last && last.price).toBe(100);
    expect(last && last.qty).toBe(100);

    me.process(o3);
    expect(me.transactionReports.length).toBe(2);
    last = me.lastTraded();
    expect(last && last.price).toBe(99);
    expect(last && last.qty).toBe(50);
  });
});

describe("cancel() mechanics", () => {
  it("limit order is removed from queue, promotion of next best bid/offer", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.Limit, 50, 99);
    const o2 = new Order("123", OrderType.Limit, 50, 100);
    const o3 = new Order("123", OrderType.Limit, 50, 101);

    me.process(o1);
    me.process(o2);
    me.process(o3);
    expect(me.bids.size()).toEqual(3);

    me.cancel(o3);
    expect(me.bids.size()).toEqual(2);
    expect(me.bids.peek()).toEqual(o2);
    expect(o3.status).toBe(OrderStatus.Cancelled);

    me.cancel(o1);
    expect(me.bids.size()).toEqual(1);
    expect(me.bids.peek()).toEqual(o2);
    expect(o1.status).toBe(OrderStatus.Cancelled);
  });

  it("verify cancelled limit order can have partial fill", () => {
    const me = new MatchingEngine();
    const o1 = new Order("1", OrderType.Limit, 50, 99);
    const o2 = new Order("2", OrderType.Limit, 50, 100);
    const o3 = new Order("3", OrderType.Limit, -25, 100);

    me.process(o1);
    me.process(o2);
    me.process(o3);

    expect(me.transactionReports[0].qty).toBe(25);
    expect(me.transactionReports[0].price).toBe(100);

    expect(me.bids.size()).toEqual(2);
    expect(o3.status).toBe(OrderStatus.Complete);
    me.cancel(o2);
    expect(me.bids.size()).toEqual(1);
    expect(o2.qtyFilled).toEqual(25);
    expect(o2.qty).toEqual(25);
    expect(o2.status).toBe(OrderStatus.Cancelled);
  });

  it("verify cancels proper order by ref", () => {
    const me = new MatchingEngine();
    const o1 = new Order("1", OrderType.Limit, 50, 100);
    const o2 = new Order("1", OrderType.Limit, 50, 100);
    const o3 = new Order("1", OrderType.Limit, 50, 100);
    const o4 = new Order("1", OrderType.Limit, 50, 100);
    const o5 = new Order("1", OrderType.Limit, 50, 100);
    const o6 = new Order("1", OrderType.Limit, -50, 101);
    const o7 = new Order("1", OrderType.Limit, -50, 101);
    me.process(o1);
    me.process(o2);
    me.process(o3);
    me.process(o4);
    me.process(o5);
    me.process(o6);
    me.process(o7);

    me.cancel(o3);
    expect(me.bids.contains(o3)).not.toBeTruthy();
    expect(o3.status).toBe(OrderStatus.Cancelled);
  });
});

describe("maxComparator / minComparator", () => {
  it("ensure maxComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order("123", OrderType.Limit, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Limit, 50, 101);

    const o3 = new Order("123", OrderType.Limit, 50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addBid(o1);
    me.addBid(o2);
    me.addBid(o3);

    expect(me.bids.peek()).toBe(o2);
    me.bids.poll();
    expect(me.bids.peek()).toBe(o1);
    me.bids.poll();
    expect(me.bids.peek()).toBe(o3);
  });

  it("ensure minComparator orders priority queue by max price then timestamp", async () => {
    const me = new MatchingEngine();

    const o1 = new Order("123", OrderType.Limit, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const o2 = new Order("123", OrderType.Limit, -50, 101);

    const o3 = new Order("123", OrderType.Limit, -50, 100);
    await new Promise((resolve) => setTimeout(resolve, 100));

    me.addOffer(o1);
    me.addOffer(o2);
    me.addOffer(o3);

    expect(me.offers.peek()).toBe(o1);
    me.offers.poll();
    expect(me.offers.peek()).toBe(o3);
    me.offers.poll();
    expect(me.offers.peek()).toBe(o2);
  });

  it("supports removal of element from queue if needed (e.g. canceled)", () => {
    const me = new MatchingEngine();
    const o1 = new Order("123", OrderType.Market, -50, 100);
    const o2 = new Order("123", OrderType.Market, -50, 101);
    const o3 = new Order("123", OrderType.Market, -50, 102);

    me.addOffer(o1);
    me.addOffer(o2);
    me.addOffer(o3);

    me.offers.remove(o2);

    expect(me.offers.contains(o1)).toBeTruthy();
    expect(me.offers.contains(o2)).toBeFalsy();
    expect(me.offers.contains(o3)).toBeTruthy();
  });

  describe("heap behaviors", () => {
    it("updateOrder() will remove/add order and maintain heap property", () => {
      const me = new MatchingEngine();
      const o1 = new Order("123", OrderType.Limit, -50, 100);
      const o2 = new Order("123", OrderType.Limit, -50, 101);
      const o3 = new Order("123", OrderType.Limit, -50, 102);

      me.addOffer(o1);
      me.addOffer(o2);
      me.addOffer(o3);

      let bestOffer = me.offers.peek();
      let updated = false;
      expect(bestOffer).toBe(o1);

      if (bestOffer) {
        updated = me.updateOrderPrice(bestOffer, 103);
      }

      expect(updated).toBeTruthy();
      bestOffer = me.offers.peek();
      expect(bestOffer).toBe(o2);
    });
  });
});
