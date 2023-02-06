import { OrderStatus, OrderType, Order, TransactionReport } from "./Order";
import Heap from "heap-js";

export default class MatchingEngine {
  //Possible classes:
  //* Order, Transaction (composed of multiple order(s) on each side)
  //*  Trader/Player class
  //* RiskCheck(Player, Order)
  //* Reporter - could just expose Matching Engine bits?

  private _bids: Heap<Order>;
  private _offers: Heap<Order>;
  private _transactionReports: TransactionReport[];

  constructor() {
    this._bids = new Heap<Order>(this.maxComparator);
    this._offers = new Heap<Order>(this.minComparator);
    this._transactionReports = [];
  }

  get bids() {
    return this._bids;
  }

  get offers() {
    return this._offers;
  }

  addBid(order: Order) {
    this._bids.add(order);
  }

  addOffer(order: Order) {
    this._offers.add(order);
  }

  get transactionReports(): TransactionReport[] {
    return this._transactionReports;
  }

  //sort descending price, FIFO
  maxComparator(a: Order, b: Order): number {
    //highest price
    if (a.price > b.price) {
      return -1;
    }
    if (a.price < b.price) {
      return 1;
    }

    //and then earliest submission FIFO
    return a.timestamp < b.timestamp ? -1 : 1;
  }

  //sort ascending price, FIFO
  minComparator(a: Order, b: Order): number {
    //highest price
    if (a.price < b.price) {
      return -1;
    }
    if (a.price > b.price) {
      return 1;
    }

    //and then earliest submission FIFO
    return a.timestamp < b.timestamp ? -1 : 1;
  }

  cancel(order: Order): void {
    //NB: disallow market order cancel()
    //in case gesture results in weird submission / timing
    if (order.orderType === OrderType.Market) return;

    //remove from bid or offer queue
    if (order.qty > 0 || order.qtyFilled > 0) {
      this.bids.remove(order);
    }

    if (order.qty < 0 || order.qtyFilled < 0) {
      this.offers.remove(order);
    }

    order.cancelled();
  }

  updateOrderPrice(order: Order, newPrice: number): boolean {
    let queue = order.qty > 0 ? this.bids : this.offers;
    const oldPrice = order.price;

    if (oldPrice === newPrice) return false;

    const removed = queue.remove(order);
    if (removed) {
      order.price = newPrice;
      queue.add(order);
    }

    return removed;
  }

  process(order: Order) {
    //choose opposing queue to execute against
    if (order.qty === 0)
      throw new Error(`Order rejected: bad quantity - ${order.qty}`);
    let queue = this.offers;
    let oppQueue = this.bids;
    if (order.qty > 0) {
      queue = this.bids;
      oppQueue = this.offers;
    }

    //choose opposing order
    let oppOrder = oppQueue.peek();
    order.status = OrderStatus.Live;

    let transactionReport: TransactionReport | null = null;

    // MARKET
    if (order.orderType === OrderType.Market) {
      //no opposite orders exist
      if (oppOrder === undefined) {
        order.reject();
        throw new Error(
          `Order rejected: no orders available to fill - queue size: ${oppQueue.size()}`
        );
      }

      //sweep orders until filled
      while (order.qty && oppOrder) {
        transactionReport = order.execute(oppOrder);

        if (oppOrder.qty === 0) {
          oppQueue.poll();
          oppOrder = oppQueue.peek();
        }

        this._transactionReports.unshift(transactionReport);
      }

      //TODO: unsure policy - no more limit orders but active market order qty remains
      //marking as complete with partial fill, doesn't join queue
      if (order.qty !== 0) {
        order.status = OrderStatus.Complete;
      }
    }

    //LIMIT

    if (order.orderType === OrderType.Limit) {
      while (order.qty && oppOrder && order.canTransact(oppOrder)) {
        transactionReport = order.execute(oppOrder);

        if (oppOrder.qty === 0) {
          oppQueue.poll();
          oppOrder = oppQueue.peek();
        }

        this._transactionReports.unshift(transactionReport);
      }

      //order qty remains with no valid opposite side candidates
      if (order.qty) {
        queue.add(order);
      }
    }
  }

  //riskChecker() - likely move out to separate class

  //Reporter
}
