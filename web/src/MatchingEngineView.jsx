import { useEffect, useState } from "react";
import GestureDecision from "./input/GestureDecision";

export default function MatchingEngineView(props) {
  const [gestureDecision, setGestureDecision] = useState(null);
  const gesture = props.gestureData && props.gestureData.gesture;

  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
    const gestureDecision = new GestureDecision(props.me);
    setGestureDecision(gestureDecision);
  }, [props.me]);

  useEffect(() => {
    //console.log("[MatchingEngineView.jsx]: useEffect gesture");
    gestureDecision && gestureDecision.calc(gesture);
  }, [gestureDecision, gesture]);

  if (!gestureDecision) return null;

  return (
    <div>
      <div>
        <p>GestureData</p>
        <span>Qty: {gestureDecision.qty}</span>
        <span>Price: {gestureDecision.price}</span>
        <span>Action: {gestureDecision.action}</span>
      </div>
      <div>
        <p>Me</p>
        <span>Bids: {JSON.stringify(props.me.bids)}</span>
        <span>Offers: {JSON.stringify(props.me.offers)}</span>
      </div>
    </div>
  );
}
