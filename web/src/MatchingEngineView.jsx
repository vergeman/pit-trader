import { useEffect } from "react";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me) return null;

  const meStyle = {
    display: "flex",
    justifyContent: "center",
    textAlign: "left",
  };

  return (
    <div style={meStyle}>
      <pre>Bids: {JSON.stringify(props.me.bids, null, 4)}</pre>
      <pre>Offers: {JSON.stringify(props.me.offers, null, 4)}</pre>
    </div>
  );
}
