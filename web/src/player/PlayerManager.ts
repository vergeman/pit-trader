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

  get numPlayers(): number {
    return Object.keys(this.players).length;
  }

  get me(): MatchingEngine {
    return this._me;
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

export default PlayerManager;
