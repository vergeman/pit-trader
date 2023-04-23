import { GestureAction } from "../gesture/Gesture";
import { EventType } from "./Event";
import { OrderType } from "../engine/Order";

/* Defaults
 * id 0 - would affect vanilla players, but for most part want to leave vanillas
 * alone because we need entities on the other side to trade against
 *
 * When adding players, best to shrink turn delay range - make players interact faster
 * currently turns are sequential, so more players means longer turns
 * possible exceeds the event duration
 *
 *
 * Headlines courtesy of chatGPT
{
  id: "test",                //group_id for any new players
  msg: `headline`,           //headline shown in info panel
  duration: 3000,            //how long effects of event last before reverting
  delta: 0,                  //delta boost around price: positive means wider bid/ask spread; negative delta
                             //means eventually crossing bid/asks and pushing market in forceDirection below
  forceDirection: null,      //new player bias buyer (1) or seller (-1) only
  addPlayers: 0,             //number of new players to add to market
  marketLoop: {
    minTurnDelay: 250,       //change timeframe window per player's turn
    maxTurnDelay: 1000,
    skipTurnThreshold: 0.33, //default .33, higher increases skipped turn (no action)
  },
},
*/

export const bossevents = [
  {
    id: "boss-1",
    type: EventType.GestureDecisionEvent,
    msg: "Hey, buy 5 for 3",
    duration: 10000,
    img: "boss-1.png",
    bonus: 30000,
    gesture: {
      qty: 5,
      price: 3,
      orderType: OrderType.Limit // Limit or Market, price market is NaN
    },
    onEnd: () => {},
    reset: () => {}
  },
];

export const events = [
  {
    id: "1",
    type: EventType.NewsEvent,
    msg: "US Economy Grew at a Faster Pace in Last Quarter Than Previously Estimated",
    duration: 7000,
    delta: -0.1,
    forceDirection: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "2",
    type: EventType.NewsEvent,
    msg: "GDP Growth Shows Robust Economic Recovery",
    duration: 7000,
    delta: -0.1,
    forceDirection: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "3",
    type: EventType.NewsEvent,
    msg: "US GDP Contracts in Last Quarter, Marking Worst Drop Since 2008 Financial Crisis",
    duration: 7000,
    delta: -0.2,
    forceDirection: -1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "4",
    type: EventType.NewsEvent,
    msg: "US Economy Shrank More Than Expected in Last Quarter",
    duration: 7000,
    delta: -0.1,
    forceDirection: -1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
  {
    id: "5",
    type: EventType.NewsEvent,
    msg: "Fed Leaves Interest Rates Unchanged, Signals Future Rate Cuts Possible",
    duration: 7000,
    delta: 0.2,
    forceDirection: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "6",
    type: EventType.NewsEvent,
    msg: "Low Interest Rates Help Sustain Economic Growth",
    duration: 7000,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 300,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "7",
    type: EventType.NewsEvent,
    msg: "Federal Reserve Raises Interest Rates, Causing Stock Market to Plunge",
    duration: 9000,
    delta: -0.25,
    forceDirection: -1,
    addPlayers: 8,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "8",
    type: EventType.NewsEvent,
    msg: "Interest Rates Hike Adds to Market Volatility, Raises Worries of Slowdown",
    duration: 9000,
    delta: -0.5,
    forceDirection: null,
    addPlayers: 8,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "9",
    type: EventType.NewsEvent,
    msg: "Inflation Rate Hits Highest Level in Years, Fueling Concerns About Rising Prices",
    duration: 9000,
    delta: 0.2,
    forceDirection: -1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "10",
    type: EventType.NewsEvent,
    msg: "Unemployment Rate Drops to Record Low, Boosting Confidence in Economy",
    duration: 3500,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.1,
    },
  },
  {
    id: "11",
    type: EventType.NewsEvent,
    msg: "Unemployment Rate Rises Unexpectedly, Raising Concerns of Economic Slowdown",
    duration: 3500,
    delta: 0.2,
    forceDirection: -1,
    addPlayers: 4,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.33,
    },
  },

  {
    id: "12",
    type: EventType.NewsEvent,
    msg: "Political Stability and Government Action Boosts Investor Confidence",
    sentiment: "bullish",
    duration: 7000,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
  {
    id: "13",
    type: EventType.NewsEvent,
    msg: "Political Turmoil and Uncertainty Leads to Market Sell-Off",
    duration: 7000,
    delta: -0.2,
    forceDirection: -1,
    addPlayers: 6,
    marketLoop: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
];

export default events;
