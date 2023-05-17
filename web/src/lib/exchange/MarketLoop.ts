import NPCPlayerManager from "../player/NPCPlayerManager";
import Player from "../player/Player";
import MatchingEngine from "./MatchingEngine";
import { Order, TransactionReport } from "./Order";

class MarketLoop {
  private _npcPlayerManager: NPCPlayerManager;
  private _me: MatchingEngine;
  private _priceSeed: number;
  private _qtySeed: number;
  private readonly _defaultMinTurnDelay: number;
  private readonly _defaultMaxTurnDelay: number;
  private readonly _defaultSkipTurnThreshold: number;
  private _skipTurnThreshold: number;
  private _loopInterval: number;
  private _isActive: boolean;
  private _isInit: boolean;

  constructor({
    npcPlayerManager,
    priceSeed,
    qtySeed,
  }: {
    npcPlayerManager: NPCPlayerManager;
    priceSeed: number;
    qtySeed?: number;
  }) {
    this._npcPlayerManager = npcPlayerManager;
    this._me = npcPlayerManager.me;
    this._priceSeed = priceSeed;
    this._qtySeed = qtySeed || 1;
    this._defaultMinTurnDelay = 150;
    this._defaultMaxTurnDelay = 500;
    this._defaultSkipTurnThreshold = 0.33;
    this._skipTurnThreshold = this._defaultSkipTurnThreshold;
    this._loopInterval = -1;
    this._isActive = false; //flag for Camera (speed up dev load)
    this._isInit = false; //flag indicating ready for run()
  }

  init() {
    const randomizedPlayers = this.npcPlayerManager.getRandomizedPlayerList();

    for (let player of randomizedPlayers) {
      const orders = player.replenish(this.priceSeed, this.qtySeed);

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
  get isActive(): boolean {
    return this._isActive;
  }
  get defaultMinTurnDelay(): number {
    return this._defaultMinTurnDelay;
  }
  get defaultMaxTurnDelay(): number {
    return this._defaultMaxTurnDelay;
  }
  get defaultSkipTurnThreshold(): number {
    return this._defaultSkipTurnThreshold;
  }
  get skipTurnThreshold(): number {
    return this._skipTurnThreshold;
  }
  set skipTurnThreshold(num: number) {
    this._skipTurnThreshold = num;
  }

  start(
    minTurnDelay: number = this._defaultMinTurnDelay,
    maxTurnDelay: number = this._defaultMaxTurnDelay
  ): number {
    //set players skip
    for (const player of this.npcPlayerManager.getRandomizedPlayerList()) {
      player.markSkipped = false;
    }

    if (this._isActive) return this._loopInterval;

    const numPlayers = this.npcPlayerManager.numPlayers;


    console.log(
      "[marketLoop] start()",
      this._isActive,
      this._loopInterval,
      minTurnDelay,
      maxTurnDelay,
      numPlayers,
      numPlayers * maxTurnDelay
    );

    this.run(minTurnDelay, maxTurnDelay);
    this._isActive = true;

    this._loopInterval = window.setInterval(
      () => this.run(minTurnDelay, maxTurnDelay),
      numPlayers * maxTurnDelay
    );

    console.log("[marketLoop] start:", this._isActive, this._loopInterval);

    return this._loopInterval;
  }

  stop(): void {
    console.log("[marketLoop] stop()", this._loopInterval);
    clearInterval(this._loopInterval);
    this._isActive = false;

    //set players to skip
    for (const player of this.npcPlayerManager.getRandomizedPlayerList()) {
      player.markSkipped = true;
    }
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
  async run(
    minTurnDelay: number,
    maxTurnDelay: number,
    delayOverride?: number
  ) {
    let players = this.npcPlayerManager.getRandomizedPlayerList();

    console.log(
      "[MarketLoop] RUN()",
      this._loopInterval,
      minTurnDelay,
      maxTurnDelay,
      players.length
    );

    for (const player of players) {
      if (player.markRemoved) continue;
      if (player.markSkipped) continue;

      console.log("TURN:", player.name, players.length);
      //delay = [minTurnDelay, maxTurnDelay] each turn takes total of
      //maxTurnDelay, but action done randomly in that period
      const delay =
        Math.floor(Math.random() * (maxTurnDelay - minTurnDelay)) +
        minTurnDelay;
      await new Promise((res) => setTimeout(res, delay));

      this.turn(player);

      //finish balance of maxTurnDelay
      await new Promise((res) => setTimeout(res, maxTurnDelay - delay));
    }

    //clear away players to be removed
    players = this.npcPlayerManager.getRandomizedPlayerList();

    for (const player of players) {
      if (player.markRemoved) {
        console.log(
          "TURN: deleting",
          player.name,
          this.npcPlayerManager.numPlayers
        );
        this.npcPlayerManager.deletePlayer(player.id);
      }
    }

    this.replenishAll();
  }

  turn(player: Player) {
    //if execution initiated by another player (this player missing either a bid
    //or offer) -> skip turn to replenish
    if (!player.hasLiveBids() || !player.hasLiveOffers()) return;

    //calc prob: do nothing
    if (player.calcSkipTurn(this.skipTurnThreshold)) return;

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
        Math.round((order.price + maxDelta) * 10) / 10
      );
      this.me.updateOrderPrice(order, order.price + maxDelta);

      //for bid/offers .1 apart, maxDelta will be 0 to prevent executing at
      //own prices. In this case we add likelihood to remove bids /offers
      //to prevent 'steady' state
      if (maxDelta === 0) {
        const prob = Math.random();

        let orderQueue: Order[] = [];
        //do nothing < .33
        //remove bids
        if (prob >= 0.33 && prob < 0.66) {
          console.log(player.name, "maxDelta 0, canceling bids");
          orderQueue = player.getLiveBids();
        }

        //remove offers
        if (prob >= 0.66) {
          console.log(player.name, "maxDelta 0, canceling offers");
          orderQueue = player.getLiveOffers();
        }

        orderQueue.forEach((order) => {
          order.cancelled();
          this.me.cancel(order);
        });
      }
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
