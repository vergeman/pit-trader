import Player from "./Player";
import MatchingEngine from "../engine/MatchingEngine";

export class PlayerManager {
  private _me: MatchingEngine;
  private _players: { [key: string]: Player };

  constructor(matchingEngine: MatchingEngine, initPlayers: Player[]) {
    this._me = matchingEngine;
    this._players = {};

    this._me = new MatchingEngine();
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
}

export default PlayerManager;
