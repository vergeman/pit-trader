import { useEffect, useState } from "react";
import MatchingEngine from './engine/MatchingEngine';
import {OrderType, Order} from './engine/Order';
import OrderQueue from './OrderQueue.jsx';

export default function MarketView(props) {

  const [matchingEngine, setMatchingEngine] = useState(null);

  useEffect(() => {
    console.log("ME init");
    const matchingEngine = new MatchingEngine();
    setMatchingEngine(matchingEngine);
  }, []);


  //TODO: make sure reliable dependency taht can handle same entry in a row
  useEffect(() => {
    const val = props.gestureFinals && props.gestureFinals.pop();
    if (matchingEngine && val) {
      const order = new Order("1", OrderType.Limit, val, 100);
      console.log("[MarketView] useEFfect Val", val);
      matchingEngine.process(order);
    }
  }, [props.gestureFinals && props.gestureFinals.length]);

  if(!matchingEngine) return null;

  //console.log("render", props.gestureFinals, matchingEngine);

  return (

    <div>
      <OrderQueue queue={matchingEngine.bids} />
      <OrderQueue queue={matchingEngine.offers} />
    </div>

  );
}