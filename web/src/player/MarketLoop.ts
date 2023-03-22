import NPCPlayerManager from "./NPCPlayerManager";
import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";
import { Order } from "../engine/Order";
import { TransactionReport } from "../engine/Order";

class MarketLoop {
  private _npcPlayerManager: NPCPlayerManager;
  private _me: MatchingEngine;
  private _priceSeed: number;
  private _qtySeed: number;
  private _loopInterval: number;
  private _isActive: boolean;
  private _isInit: boolean;

  constructor(
    npcPlayerManager: NPCPlayerManager,
    priceSeed: number,
    qtySeed: number
  ) {
    this._npcPlayerManager = npcPlayerManager;
    this._me = npcPlayerManager.me;
    this._priceSeed = priceSeed;
    this._qtySeed = qtySeed;
    this._loopInterval = -1;
    this._isActive = false; //flag for Camera (speed up dev load)
    this._isInit = false;   //flag indicating ready for run()
  }

  init() {
    const randomizedPlayers = this.npcPlayerManager.getRandomizedPlayerList();

    for (let player of randomizedPlayers) {
      const delta = player.generateRandomMax() / 10;
      const orders = player.replenish(this.priceSeed, this.qtySeed, delta);

      //add to ME
      for (const order of orders) {
        this.me.process(order);
      }
    }

    this._isInit = true;
  }

  get npcPlayerManager(): NPCPlayerManager {
    return this._npcPlayerManager;
  }
  get me(): MatchingEngine {
    return this._me;
  }
  get priceSeed(): number {
    return this._priceSeed;
  }
  get qtySeed(): number {
    return this._qtySeed;
  }
  get isInit(): boolean {
    return this._isInit;
  }

  stop() {
    this._isActive = false;
  }

  getDisplayLastPrice(): number | null {
    const lastQtyPrice: TransactionReport = this.me.transactionReports[0];
    if (lastQtyPrice && lastQtyPrice.price) {
      const lastPrice = lastQtyPrice.price;
      return Number(lastPrice.toFixed(1));
    }

    return null;
  }

  getPrice(): number {
    /*
     * returns price used to orient gestureDecision input (digit selection),
     * price seeding, npc generated bid/offers, win/lose condition
     *
     * hierarchy to describe "active", relevant price:
     *
     * 1. current bid/offer? midpoint of current bid/offer
     * 2. no markets? use last
     * 3. no markets, no last? default price seed (no market, nothing traded)
     *
     */

    //last price
    const lastQtyPrice: TransactionReport = this.me.transactionReports[0];
    let midpoint = null;

    //midpoint best bid best offer
    const best_bid_order = this.me.bids.peek();
    const best_offer_order = this.me.offers.peek();
    let lastBetween = false;

    if (best_bid_order && best_offer_order) {
      midpoint = (best_bid_order.price + best_offer_order.price) / 2;

      if (lastQtyPrice) {
        lastBetween =
          lastQtyPrice.price >= best_bid_order.price &&
          lastQtyPrice.price <= best_offer_order.price;
      }
    }

    //midpoint, but nothing traded
    if (midpoint && !lastBetween) {
      return midpoint;
    }

    //if midpoint, then last is between and just as good
    //if no active market, need to start somewhere
    if (lastQtyPrice) {
      return lastQtyPrice.price;
    }

    //no market (no midpoint) and never traded
    return this.priceSeed;
  }

  //run()
  //each player takes a turn() - undergoes a series of actions
  //each player's turn takes maxTurnDelay
  //within each player's turn - the actual action (turn() call) is randomized
  async run(maxTurnDelay: number, baseDelay: number = 250) {
    //console.log("[MarketLoop] RUN", Date.now(), maxTurnDelay);

    const players = this.npcPlayerManager.getRandomizedPlayerList();

    for (const player of players) {
      console.log("TURN:", player.name);

      //delay = [baseDelay, maxTurnDelay - baseDelay] e.g [250, 750]
      const delay =
        Math.floor(Math.random() * (maxTurnDelay - baseDelay)) + baseDelay;
      await new Promise((res) => setTimeout(res, delay));

      this.turn(player);

      //finish balance of maxTurnDelay
      await new Promise((res) => setTimeout(res, maxTurnDelay - delay));
    }

    this.replenishAll();
  }

  turn(player: Player, probSkip: number = 0.33) {
    //if execution initiated by another player (this player missing either a bid
    //or offer) -> skip turn to replenish
    if (!player.hasLiveBids() || !player.hasLiveOffers()) return;

    //calc prob: do nothing
    if (player.calcSkipTurn(probSkip)) return;

    //
    // at this point player has bid and offer - now attempt to induce action
    //

    const bidOfferToggle = Math.random() > 0.5;
    const maxDelta = bidOfferToggle
      ? player.calcMaxBidOfferDelta()
      : -player.calcMaxBidOfferDelta();
    const queue = bidOfferToggle
      ? player.getLiveBids()
      : player.getLiveOffers();
    queue.forEach((order) => {
      console.log(
        player.name,
        "price:",
        order.price,
        maxDelta,
        "->",
        order.price + maxDelta
      );
      this.me.updateOrderPrice(order, order.price + maxDelta);
    });
  }

  replenishAll(): number {
    const players = Object.values(this.npcPlayerManager.players);
    const newPrice = this.getPrice();
    let orders: Order[] = [];

    for (const player of players) {
      const playerOrders = player.replenish(newPrice);
      orders = orders.concat(playerOrders);
    }

    for (let order of orders) {
      this.me.process(order);
    }

    return orders.length;
  }
}

export { MarketLoop };
export default MarketLoop;
