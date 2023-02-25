import { useEffect } from "react";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me) return null;

  const { bidMap, bidPriceLabel } = props.me.getSumBids(props.player.id);
  const { offerMap, offerPriceLabel } = props.me.getSumOffers(props.player.id);

  /* Styles */
  const gridWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    width: "400px",
  };
  const gridWrapStyle = {
    width: "700px",
  };
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    gridAutoRows: "100px 100px",
  };
  const gridOffersStyle = {
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-end",
    textAlign: "left",
  };
  const gridBidsStyle = {
    display: "flex",
    flexDirection: "column",
    alignSelf: "flex-start",
    textAlign: "right",
  };

  return (
    <div className="grid-wrapper" style={gridWrapperStyle}>
      <div className="grid-wrap" style={gridWrapStyle}>
        <p>Market View</p>
        <div className="grid" style={gridStyle}>
          <div></div>
          <div className="grid-offers" style={gridOffersStyle}>
            {Array.from(offerMap).map(([price, qty]) => {
              let gridElementStyle = {};
              if (offerPriceLabel[price]) {
                gridElementStyle = { background: "yellow" };
              }

              return (
                <div className="grid-offers-offer" style={gridElementStyle}>
                  <span>{price}</span>
                  <span> | </span>
                  <span>{qty}</span>
                  <span> | </span>

                  {/*
                <span>{offer.price}</span>
                <span> | </span>
                <span>{offer.qty}</span>
                <span> | </span>
                <span>{(new Date(offer.timestamp)).toLocaleTimeString()}</span>
              */}
                </div>
              );
            })}
          </div>

          <div className="grid-bids" style={gridBidsStyle}>
            {Array.from(bidMap).map(([price, qty]) => {
              let gridElementStyle = {};
              if (bidPriceLabel[price]) {
                gridElementStyle = { background: "yellow" };
              }

              return (
                <div className="grid-bids-bid" style={gridElementStyle}>
                  <span>{qty}</span>
                  <span> | </span>
                  <span>{price}</span>
                  <span> | </span>

                  {/*
                <span>{(new Date(bid.timestamp)).toLocaleTimeString()}</span>
                <span> | </span>
                <span>{bid.qty}</span>
                <span> | </span>
                <span>{bid.price}</span>
              */}
                </div>
              );
            })}
          </div>

          <div></div>
        </div>
      </div>
    </div>
  );
}
