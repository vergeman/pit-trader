import Player from "./Player";
import MatchingEngine from "../exchange/MatchingEngine";

export default class NPCPlayerManager {
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

  get numPlayers(): number {
    const players = Object.keys(this._players);
    return players.length;
  }

  get me(): MatchingEngine {
    return this._me;
  }

  incrementLevel() {
    const players = Object.values(this._players);
    for (let player of players) {
      player.incrementLevel();
    }
  }

  deletePlayer(id: string): boolean {
    const d = delete this._players[id];
    return d;
  }

  markRemovePlayer(id: string): boolean {
    const player = this.players[id];
    const bids = player.getLiveBids();
    const offers = player.getLiveOffers();
    const liveOrders = ([] as any).concat(bids, offers);

    for (let order of liveOrders) {
      this._me.cancel(order);
    }

    this.players[id].markRemoved = true;
    return this.players[id].markRemoved;
  }

  markRemoveGroup(group_id: string): number {
    const players = Object.values(this._players);
    let num = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].group_id === group_id) {
        this.markRemovePlayer(players[i].id);
        num++;
      }
    }
    return num;
  }

  resetAll() {
    const players = Object.values(this._players);
    players.forEach((player) => player.reset());
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
}
