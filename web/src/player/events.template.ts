import { EventType } from "./Event";
import { OrderType } from "../engine/Order";
import { GestureAction } from "../gesture/Gesture";
import { GestureDecisionEventState } from "./GestureDecisionEvent";

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

export const buildGestureDecisionEventParams = (gde: any, price: number) => {
  const _qty = Math.floor(Math.random() * 10) + 1; //[1,10]
  const gesturePrice = price.toFixed(1).at(-1) || 0; //100.2 <-- 2
  const action = Math.random() <= 0.5 ? GestureAction.BUY : GestureAction.SELL;

  const gesture = {
    qty: action == GestureAction.BUY ? _qty : -_qty,
    price: gesturePrice,
    orderType: OrderType.Limit,
  };

  //replace qty price templates with generated values above
  const state_msg = {
    ...gde.state_msg,
  };

  for (const [k, v] of Object.entries(state_msg)) {
    const val = (v as string)
      .replace("{QTY}", Math.abs(gesture.qty).toString())
      .replace("{PRICE}", gesture.price.toString());
    state_msg[k] = val;
  }

  return {
    ...gde,
    state_msg,
    action,
    type: EventType.GESTUREDECISION,
    msg: state_msg[`${GestureDecisionEventState.ACTIVE}-${action}`],
    gesture,
    onEnd: () => {},
  };
};

export const gestureDecisionEvents = [
  //trickster
  {
    id: "trickster-1",
    img: `${process.env.PUBLIC_URL}/events/trickster.png`,
    state_msg: {
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.BUY}`]: `Let's see what happens. Pay {PRICE} for {QTY}`,
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.SELL}`]:
        "Let's see what happens. Sell {QTY} at {PRICE}",
      [GestureDecisionEventState.NOMATCH]: "Try again, slick.",
      [GestureDecisionEventState.LOST]: "Better luck next time.",
      [GestureDecisionEventState.WIN]: "Nice job!",
    },
  },

  //hipster
  {
    id: "hipster-1",
    img: `${process.env.PUBLIC_URL}/events/hipster.png`,
    state_msg: {
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.BUY}`]: `Pay {PRICE} for {QTY}, dude.`,
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.SELL}`]:
        "Sell {QTY} at {PRICE}, dude",
      [GestureDecisionEventState.NOMATCH]: "That's not it, amigo.",
      [GestureDecisionEventState.LOST]: "Too bad, your loss",
      [GestureDecisionEventState.WIN]: "Way to go, Ace!",
    },
  },

  //starwars
  {
    id: "starwars-1",
    img: `${process.env.PUBLIC_URL}/events/starwars.png`,
    state_msg: {
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.BUY}`]: `Ootini! Pay {PRICE} for {QTY}.`,
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.SELL}`]:
        "Jotadee, Sell {QTY} at {PRICE}.",
      [GestureDecisionEventState.NOMATCH]: "Koo nee tang, no match.",
      [GestureDecisionEventState.LOST]: "You lose!",
      [GestureDecisionEventState.WIN]: "Suka! Well done!",
    },
  },

  //death
  {
    id: "death-1",
    img: `${process.env.PUBLIC_URL}/events/death.png`,
    state_msg: {
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.BUY}`]: `Pay {PRICE} for {QTY}. Or else.`,
      [`${GestureDecisionEventState.ACTIVE}-${GestureAction.SELL}`]:
        "Sell {QTY} at {PRICE}. Or else.",
      [GestureDecisionEventState.NOMATCH]: "Nervous? You keep messing up.",
      [GestureDecisionEventState.LOST]: "Loss comes in many forms . . .",
      [GestureDecisionEventState.WIN]: "Well done. But I will return . . .",
    },
  },
];

export const events = [
  {
    id: "1",
    type: EventType.NEWS,
    msg: "US Economy Grew at a Faster Pace in Last Quarter Than Previously Estimated",
    duration: 7000,
    delta: -0.1,
    forceDirection: 1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "2",
    type: EventType.NEWS,
    msg: "GDP Growth Shows Robust Economic Recovery",
    duration: 7000,
    delta: -0.1,
    forceDirection: 1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "3",
    type: EventType.NEWS,
    msg: "US GDP Contracts in Last Quarter, Marking Worst Drop Since 2008 Financial Crisis",
    duration: 7000,
    delta: -0.2,
    forceDirection: -1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "4",
    type: EventType.NEWS,
    msg: "US Economy Shrank More Than Expected in Last Quarter",
    duration: 7000,
    delta: -0.1,
    forceDirection: -1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
  {
    id: "5",
    type: EventType.NEWS,
    msg: "Fed Leaves Interest Rates Unchanged, Signals Future Rate Cuts Possible",
    duration: 7000,
    delta: 0.2,
    forceDirection: 1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.33,
    },
  },
  {
    id: "6",
    type: EventType.NEWS,
    msg: "Low Interest Rates Help Sustain Economic Growth",
    duration: 7000,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 300,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "7",
    type: EventType.NEWS,
    msg: "Federal Reserve Raises Interest Rates, Causing Stock Market to Plunge",
    duration: 9000,
    delta: -0.25,
    forceDirection: -1,
    addPlayers: 8,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0,
    },
  },
  {
    id: "8",
    type: EventType.NEWS,
    msg: "Interest Rates Hike Adds to Market Volatility, Raises Worries of Slowdown",
    duration: 9000,
    delta: -0.5,
    forceDirection: null,
    addPlayers: 8,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "9",
    type: EventType.NEWS,
    msg: "Inflation Rate Hits Highest Level in Years, Fueling Concerns About Rising Prices",
    duration: 9000,
    delta: 0.2,
    forceDirection: -1,
    addPlayers: 6,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.25,
    },
  },
  {
    id: "10",
    type: EventType.NEWS,
    msg: "Unemployment Rate Drops to Record Low, Boosting Confidence in Economy",
    duration: 3500,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 6,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.1,
    },
  },
  {
    id: "11",
    type: EventType.NEWS,
    msg: "Unemployment Rate Rises Unexpectedly, Raising Concerns of Economic Slowdown",
    duration: 3500,
    delta: 0.2,
    forceDirection: -1,
    addPlayers: 4,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.33,
    },
  },

  {
    id: "12",
    type: EventType.NEWS,
    msg: "Political Stability and Government Action Boosts Investor Confidence",
    sentiment: "bullish",
    duration: 7000,
    delta: -0.2,
    forceDirection: 1,
    addPlayers: 6,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
  {
    id: "13",
    type: EventType.NEWS,
    msg: "Political Turmoil and Uncertainty Leads to Market Sell-Off",
    duration: 7000,
    delta: -0.2,
    forceDirection: -1,
    addPlayers: 6,
    marketLoopConfig: {
      minTurnDelay: 150,
      maxTurnDelay: 350,
      skipTurnThreshold: 0.125,
    },
  },
];

export default events;
