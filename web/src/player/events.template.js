const events = [
  {
    msg: `bye`,
    duration: 3000,
    delta: 1,
    direction: 1,
    numPlayer: 0,
    marketLoop: {
      minTurnDelay: 100,
      maxTurnDelay: 250,
      skipTurnThreshold: 0.2, //default .33, higher increases skipped turn (no action)
    },
  },
  {
    msg: `bye2`,
    duration: 3000,
    delta: 1,
    direction: 1,
    numPlayer: 0,
    marketLoop: {
      minTurnDelay: 100,
      maxTurnDelay: 250,
      skipTurnThreshold: 1,
    },
  },
];

export default events;
