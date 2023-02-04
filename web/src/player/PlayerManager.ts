import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";
import Order, { OrderType } from "../engine/Order";

export class PlayerManager {
  private _me: MatchingEngine;
  private _players: { [key: string]: Player };

  constructor(matchingEngine: MatchingEngine, initPlayers: Player[]) {
    this._me = matchingEngine;
    this._players = {};
    this._setInitPlayers(initPlayers);
  }

  _setInitPlayers(initPlayers: Player[]) {
    for (let player of Object.values(initPlayers)) {
      this._players[player.id] = player;
    }
  }

  addPlayer(player: Player): void {
    this._players[player.id] = player;
  }

  get players(): { [key: string]: Player } {
    return this._players;
  }

  get me(): MatchingEngine {
    return this._me;
  }

  init(priceSeed: number = 100, qtySeed: number = 4) {
    const randomizedPlayers = this.getRandomizedPlayerList();

    for (let player of randomizedPlayers) {
      const delta = this.generateRandomDelta();
      const bidPrice = priceSeed - delta;
      const offerPrice = priceSeed + delta;

      //NB: qtySeed + 1 since 0 is valid number in random range, but invalid
      //quantity
      const bidQty = Math.floor(Math.random() * qtySeed + 1);
      const offerQty = -Math.floor(Math.random() * qtySeed + 1);

      const bidOrder = new Order(player.id, OrderType.Limit, bidQty, bidPrice);
      const offerOrder = new Order(
        player.id,
        OrderType.Limit,
        offerQty,
        offerPrice
      );

      player.addOrder(bidOrder);
      player.addOrder(offerOrder);

      this._me.process(bidOrder);
      this._me.process(offerOrder);
    }

  }

  getRandomizedPlayerList(): Player[] {
    const players = Object.values(this._players);
    let num = players.length;
    let indexes = [...Array(num).keys()]; //[0 to num]

    //shuffle indices
    while (num) {
      const idx = Math.floor(Math.random() * num);

      let temp = indexes[num - 1];
      indexes[num - 1] = indexes[idx];
      indexes[idx] = temp;
      num -= 1;
    }

    //return random copy
    //(unsure if its ok to shuffle this._players directly)
    const randomizedPlayers = [];
    for (let i = 0; i < indexes.length; i++) {
      const idx = indexes[i];
      randomizedPlayers.push(players[idx]);
    }

    return randomizedPlayers;
  }

  //random digit .1-.5
  generateRandomDelta(max: number = 4): number {
    return (Math.floor(Math.random() * max) + 1) / 10;
  }
}

export default PlayerManager;
