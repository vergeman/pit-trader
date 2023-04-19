const events = [
  {
    id: "test",
    msg: `bye`,
    duration: 3000,
    delta: 0,
    direction: 1,
    addPlayers: 0,
    marketLoop: {
      minTurnDelay: 100,
      maxTurnDelay: 250,
      skipTurnThreshold: 0.2, //default .33, higher increases skipped turn (no action)
    },
  },
  {
    id: "test2",
    msg: `bye2`,
    duration: 3000,
    delta: 0,
    direction: 1,
    addPlayers: 0,
    marketLoop: {
      minTurnDelay: 100,
      maxTurnDelay: 250,
      skipTurnThreshold: 1,
    },
  },
  {
    id: "test3",
    msg: `add players`,
    duration: 10000,
    delta: 0,
    direction: 1,
    addPlayers: 4,  //TODO: add by group-id? then we can add vanillas
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: .33,
    }
  },
  {
    id: "test4",
    msg: `delta boost`,
    duration: 10000,
    delta: .5,
    direction: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: .33,
    }
  },

];

export default events;
