import { OrderStatus, OrderType, Order, TransactionReport } from "./Order";
import Heap from "heap-js";

export interface Grid {
  gridNumMinLen: Number;
  gridNumMaxLen: Number;
  prices: String[];
}

export interface OrderMap {
  allOrdersPriceQtyMap: Map<Number, Number>;
  playerOrdersPriceQtyMap: Map<Number, Number>;
}

export class MatchingEngine {
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

  getOfferMaps(player_id: string): OrderMap {
    return this.getSums(this.offers.toArray(), player_id);
  }

  getBidMaps(player_id: string): OrderMap {
    return this.getSums(this.bids.toArray(), player_id);
  }

  getSums(collection: Order[], player_id: string): OrderMap {
    const orderMap = new Map();
    const playerOrderMap = new Map();

    collection
      .sort((a: Order, b: Order) => {
        if (a.price - b.price === 0) return Number(a.timestamp > b.timestamp);
        return Number(a.price < b.price);
      })
      .forEach((order: Order) => {
        const qty = (orderMap.get(order.price) || 0) + order.qty;
        orderMap.set(order.price, qty);

        if (order.player_id === player_id) {
          const player_qty = (playerOrderMap.get(order.price) || 0) + order.qty;
          playerOrderMap.set(order.price, player_qty);
        }
      });

    return {
      allOrdersPriceQtyMap: orderMap,
      playerOrdersPriceQtyMap: playerOrderMap,
    };
  }

  calcGrid(price: Number, numGridPoints: Number = 19): Grid {
    //numGridPoints: 20 points e.g. range of 99 - 101
    const midPoint = Number(price.toFixed(1));
    const start = midPoint + 1;
    let strLen = String(midPoint).length; //NB: length of digits
    let gridNumMinLen = strLen;
    let gridNumMaxLen = strLen;

    const prices = [];
    for (let i = 0; i < numGridPoints; i++) {
      //generate price values high to low
      const val = (start - i / 10).toFixed(1);
      prices.push(val);

      //catch string lengths for aligned render
      strLen = String(val).length;
      gridNumMaxLen = Math.max(strLen, gridNumMaxLen);
      gridNumMinLen = Math.min(strLen, gridNumMinLen);
    }

    return { gridNumMinLen, gridNumMaxLen, prices };
  }

  addBid(order: Order) {
    this._bids.add(order);
  }

  addOffer(order: Order) {
    this._offers.add(order);
  }

  reset() {
    this._bids = new Heap<Order>(this.maxComparator);
    this._offers = new Heap<Order>(this.minComparator);
    this._transactionReports = [];
  }

  get transactionReports(): TransactionReport[] {
    return this._transactionReports;
  }

  lastTraded(): TransactionReport | undefined {
    return this.transactionReports.at(0);
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
    if (order.orderType === OrderType.MARKET) return;

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

    //need to maintain queue order
    //in retrospect queue was probably not a good datastructure
    const removed = queue.remove(order);
    if (removed) {
      order.price = newPrice;
      this.process(order);
    }

    //console.log("updateOrderPrice", order.qty, oldPrice, "->", newPrice);
    return removed;
  }

  process(order: Order) {
    //choose opposing queue to execute against
    if (order.qty === 0)
      throw new Error(`Order rejected: bad quantity: ${order.qty}`, {
        cause: { qty: order.qty },
      });
    let queue = this.offers;
    let oppQueue = this.bids;
    if (order.qty > 0) {
      queue = this.bids;
      oppQueue = this.offers;
    }

    //choose opposing order
    let oppOrder = oppQueue.peek();
    //check if self-executing
    //quietly allow it for NPC's, but not for live player
    if (
      oppOrder &&
      order.player_isLive &&
      order.player_id == oppOrder.player_id
    ) {
      order.reject();
      throw new Error(`Wash Trade Restriction: cannot trade with yourself.`, {
        cause: order,
      });
    }

    order.status = OrderStatus.LIVE;
    let transactionReport: TransactionReport | null = null;

    // MARKET
    if (order.orderType === OrderType.MARKET) {
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
        order.status = OrderStatus.COMPLETE;
      }
    }

    //LIMIT

    if (order.orderType === OrderType.LIMIT) {
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

export default MatchingEngine;
