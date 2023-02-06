import PlayerManager from "./PlayerManager";
import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";
import { TransactionReport } from "../engine/Order";

class MarketLoop {
  private _playerManager: PlayerManager;
  private _me: MatchingEngine;
  private _priceSeed: number;
  private _qtySeed: number;
  private _loopInterval: number;
  private _isActive: boolean;

  constructor(playerManager: PlayerManager, priceSeed: number, qtySeed: number) {
    this._playerManager = playerManager;
    this._me = playerManager.me;
    this._priceSeed = priceSeed;
    this._qtySeed = qtySeed;
    this._loopInterval = -1;
    this._isActive = false;
  }

  init() {
    this._playerManager.init(this.priceSeed, this.qtySeed);
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

  getPrice(): number {
    //why not use only last or midpoint?
    //markets can drift and move, exceeding last (aka not traded in a while)
    //bid/offer can be wide - last is a better reflection of "value"

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

    //TODO: generate next deltas all players
    this._playerManager.setNewDeltas();

    const players = this._playerManager.getRandomizedPlayerList();

    let _delay = delay || (Math.floor(Math.random() * 750) + 250)

    for (const player of players) {

      //setTimeout - want some delay b/w
      await new Promise(res => setTimeout(res, _delay));

      this.turn(player);

    }

    //TODO: replenish bids / offers
    //TODO: or is this update bids offers with new deltas
    //this._playerManager.replenishAll();
  }

  turn(player: Player) {
    console.log(player.name);

    //player step trelo


  }

  //executes run() on a setInterval
  startLoop(interval: number) {
    this._loopInterval = setInterval(this.run, interval);
  }

  stopLoop() {
    clearInterval(this._loopInterval);
  }

  //replenish()

}

export {MarketLoop}
export default MarketLoop