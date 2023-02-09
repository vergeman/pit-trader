import { useEffect, useState } from "react";
import GestureDecision from "./input/GestureDecision";

export default function MatchingEngineView(props) {
  const [gestureDecision, setGestureDecision] = useState(null);
  const gesture = props.gestureData && props.gestureData.gesture;

  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
    const gestureDecision = new GestureDecision(props.me, props.player);
    setGestureDecision(gestureDecision);
  }, [props.me, props.player]);

  useEffect(() => {
    gestureDecision && gestureDecision.calc(gesture);
  }, [gestureDecision, gesture]);

  if (!gestureDecision) return null;

  const meStyle = {
    display: "flex",
    justifyContent: "center",
    textAlign: "left",
  };

  return (
    <div>
      <div>
        <p>GestureData</p>
        <span>Qty: {gestureDecision.qty}</span>
        <span>Price: {gestureDecision.price}</span>
        <span>Action: {gestureDecision.action}</span>
      </div>
      <div style={meStyle}>
        <pre>Bids: {JSON.stringify(props.me.bids, null, 4)}</pre>
        <pre>Offers: {JSON.stringify(props.me.offers, null, 4)}</pre>
      </div>
    </div>
  );
}
