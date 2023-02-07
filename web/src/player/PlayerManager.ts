import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";

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

  init(price: number, qtyMax: number) {
    const randomizedPlayers = this.getRandomizedPlayerList();

    for (let player of randomizedPlayers) {
      const delta = this.generateRandomMax() / 10;

      //bid
      const bidOrder = player.buildOrder(
        this.generateRandomMax(qtyMax),
        price - delta
      );

      //offer
      const offerOrder = player.buildOrder(
        -this.generateRandomMax(qtyMax),
        price + delta
      );

      //add to player, ME
      for (const order of [bidOrder, offerOrder]) {
        player.addOrder(order);
        this.me.process(order);
      }
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

  setNewDeltas() {
    for (let player of Object.values(this._players)) {
      player.delta = this.generateRandomMax() / 10;
    }
  }
  generateRandomMax(qtyMax: number = 5): number {
    return Math.floor(Math.random() * qtyMax + 1);
  }

}

export default PlayerManager;
