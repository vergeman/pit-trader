import { useEffect } from "react";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me) return null;

  const gridWrapperStyle = {
    display: "flex",
    justifyContent: "center",
    width: "400px"
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

  const offers = props.me.offers.toArray().sort( (a,b) => {
    if (a.price - b.price == 0) return a.timestamp > b.timestamp
    return a.price > b.price
  });

  const bids = props.me.bids.toArray().sort( (a,b) => {
    if (a.price - b.price === 0) return a.timestamp > b.timestamp
    return a.price < b.price
  });

  return (
    <div className="grid-wrapper" style={gridWrapperStyle}>

      <div className="grid-wrap" style={gridWrapStyle}>
        <p>Market View</p>
        <div className="grid" style={gridStyle}>
          <div></div>
          <div className="grid-offers" style={gridOffersStyle}>
            {
              offers.map( offer => {

                let gridElementStyle = {};
                if(offer.player_id == props.player.id) {
                  gridElementStyle = {background: "yellow"}
                }

                return(

                  <div className="grid-offers-offer" style={gridElementStyle}>

                    <span>{offer.price}</span>
                    <span> | </span>
                    <span>{offer.qty}</span>
                    <span> | </span>
                    <span>{(new Date(offer.timestamp)).toLocaleTimeString()}</span>
                  </div>
                )
              })
            }
          </div>

          <div className="grid-bids" style={gridBidsStyle}>
            {
              bids.map( bid => {

                let gridElementStyle = {};
                if(bid.player_id == props.player.id) {
                  gridElementStyle = {background: "yellow"}
                }

                return(
                  <div className="grid-bids-bid" style={gridElementStyle}>
                    <span>{(new Date(bid.timestamp)).toLocaleTimeString()}</span>
                    <span> | </span>
                    <span>{bid.qty}</span>
                    <span> | </span>
                    <span>{bid.price}</span>
                  </div>
                )
              })
            }
          </div>


          <div></div>

        </div>
      </div>
    </div>
  );
}
