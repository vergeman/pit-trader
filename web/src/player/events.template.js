/* Defaults
 * id 0 - would affect vanilla players, but for most part want to leave vanillas
 * alone because we need entities on the other side to trade against
 *
 * Headlines courtesy of chatGPT
{
  id: "test",                //group_id for any new players
  msg: `headline`,           //headline shown in info panel
  duration: 3000,            //how long effects of event last before reverting
  delta: 0,                  //new player delta boost (wider spread)
  forceDirection: null,      //new player bias buyer (1) or seller (-1) only
  addPlayers: 0,             //number of new players to add to market
  marketLoop: {
    minTurnDelay: 250,       //change timeframe window per player's turn
    maxTurnDelay: 1000,
    skipTurnThreshold: 0.33, //default .33, higher increases skipped turn (no action)
  },
},
*/
const events = [
  {
    id: "1",
    msg: "US Economy Grew at a Faster Pace in Last Quarter Than Previously Estimated",
    duration: 5000,
    delta: 0,
    forceDirection: null,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "2",
    msg: "GDP Growth Shows Robust Economic Recovery",
    duration: 5000,
    delta: 0,
    forceDirection: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "3",
    msg: "US GDP Contracts in Last Quarter, Marking Worst Drop Since 2008 Financial Crisis",
    duration: 5000,
    delta: 0,
    forceDirection: -1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "4",
    msg: "US Economy Shrank More Than Expected in Last Quarter",
    duration: 5000,
    delta: 0,
    forceDirection: null,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "5",
    msg: "Fed Leaves Interest Rates Unchanged, Signals Future Rate Cuts Possible",
    duration: 5000,
    delta: 0.25,
    forceDirection: null,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 1000,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "6",
    msg: "Low Interest Rates Help Sustain Economic Growth",
    duration: 5000,
    delta: 0.25,
    forceDirection: null,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 1000,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "7",
    msg: "Federal Reserve Raises Interest Rates, Causing Stock Market to Plunge",

    duration: 10000,
    delta: 0,
    forceDirection: -1,
    addPlayers: 8,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "8",
    msg: "Interest Rates Hike Adds to Market Volatility, Raises Worries of Slowdown",

    duration: 5000,
    delta: 0.5,
    forceDirection: null,
    addPlayers: 8,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "9",
    msg: "Inflation Rate Hits Highest Level in Years, Fueling Concerns About Rising Prices",

    duration: 5000,
    delta: 0,
    forceDirection: -1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "10",
    msg: "Unemployment Rate Drops to Record Low, Boosting Confidence in Economy",
    sentiment: "bullish",
    duration: 5000,
    delta: 0,
    forceDirection: 1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "11",
    msg: "Unemployment Rate Rises Unexpectedly, Raising Concerns of Economic Slowdown",

    duration: 5000,
    delta: 0.25,
    forceDirection: -1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 1000,
      skipTurnThreshold: 0.33,
    },
  },

  {
    id: "12",
    msg: "Political Stability and Government Action Boosts Investor Confidence",
    sentiment: "bullish",
    duration: 5000,
    delta: 0,
    forceDirection: 1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 500,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "13",
    msg: "Political Turmoil and Uncertainty Leads to Market Sell-Off",

    duration: 5000,
    delta: 0,
    forceDirection: -1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 250,
      maxTurnDelay: 1000,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "14",
    msg: "WORLD WAR III GLOBAL CONFLICT",

    duration: 15000,
    delta: 0.25,
    forceDirection: -1,
    addPlayers: 18,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 300,
      skipTurnThreshold: 0.1,
    },
  },
];

export default events;
