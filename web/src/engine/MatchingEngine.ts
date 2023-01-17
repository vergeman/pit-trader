import Order from "./Order";
import {
  PriorityQueue,
  ICompare, //  (a: T, b: T): number;
} from "@datastructures-js/priority-queue";

export default class MatchingEngine {
  //Possible classes:
  //* Order, Transaction (composed of multiple order(s) on each side)
  //*  Trader/Player class
  //* RiskCheck(Player, Order)
  //* Reporter - could just expose Matching Engine bits?

  private _bids: PriorityQueue<Order>;
  private _offers: PriorityQueue<Order>;

  constructor() {
    this._bids = new PriorityQueue<Order>(this.maxComparator);
    this._offers = new PriorityQueue<Order>(this.minComparator);
  }

  get bids() {
    return this._bids;
  }

  get offers() {
    return this._offers;
  }

  addBid(order: Order) {
    this._bids.enqueue(order);
  }

  addOffer(order: Order) {
    this._offers.enqueue(order);
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

  process(order: number) {
    //state logic
    //returns Transaction, success / error
  }

  //riskChecker() - likely move out to separate class

  //partial fill logic

  //Reporter
}
