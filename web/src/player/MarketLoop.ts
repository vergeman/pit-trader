import PlayerManager from "./PlayerManager";
import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";
import { Order } from "../engine/Order";
import { TransactionReport } from "../engine/Order";

class MarketLoop {
  private _playerManager: PlayerManager;
  private _me: MatchingEngine;
  private _priceSeed: number;
  private _qtySeed: number;
  private _loopInterval: number;
  private _isActive: boolean;

  constructor(
    playerManager: PlayerManager,
    priceSeed: number,
    qtySeed: number
  ) {
    this._playerManager = playerManager;
    this._me = playerManager.me;
    this._priceSeed = priceSeed;
    this._qtySeed = qtySeed;
    this._loopInterval = -1;
    this._isActive = false;
  }

  init() {
    const randomizedPlayers = this.playerManager.getRandomizedPlayerList();

    for (let player of randomizedPlayers) {
      const delta = player.generateRandomMax() / 10;
      const orders = player.replenish(this.priceSeed, this.qtySeed, delta);

      //add to ME
      for (const order of orders) {
        this.me.process(order);
      }
    }
  }

  get playerManager(): PlayerManager {
    return this._playerManager;
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

  stop() {
    this._isActive = false;
  }

  getLastPrice(): number | null {
    const lastQtyPrice: TransactionReport = this.me.transactionReports[0];
    if (lastQtyPrice && lastQtyPrice.price) return lastQtyPrice.price;
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

  //represents a single turn
  //where each player undergoes a series of actions
  async run(delay: number) {
    //TODO: deprecated methinks
    //this._playerManager.setNewDeltas();

    const players = this._playerManager.getRandomizedPlayerList();

    let _delay = delay || Math.floor(Math.random() * 750) + 250;

    for (const player of players) {
      //setTimeout - want some delay b/w
      await new Promise((res) => setTimeout(res, _delay));

      this.turn(player);

      // end scenario?
      const marketPrice = this.getPrice();
      if (player.isLive && player.hasLost(marketPrice)) {
        //TODO: trigger lose event / screen
      }
    }

    this.replenishAll();
  }

  turn(player: Player, probSkip: number = 0.33) {
    //console.log(player.name);

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
    queue.forEach((order) =>
      this.me.updateOrderPrice(order, order.price + maxDelta)
    );
  }

  //executes run() on a setInterval
  startLoop(interval: number) {
    this._loopInterval = setInterval(this.run, interval);
  }

  stopLoop() {
    clearInterval(this._loopInterval);
  }

  replenishAll(): number {
    const players = Object.values(this.playerManager.players);
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
