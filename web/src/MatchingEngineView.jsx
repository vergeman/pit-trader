import { useEffect } from "react";
import { Table } from "react-bootstrap";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me || !props.marketLoop) return null;

  const price = props.marketLoop && props.marketLoop.getPrice();
  const lastPrice = props.marketLoop && props.marketLoop.getDisplayLastPrice();

  const bidMaps = props.me.getBidMaps(props.player.id);
  const offerMaps = props.me.getOfferMaps(props.player.id);
  const { gridNumMinLen, gridNumMaxLen, prices } = props.me.calcGrid(price);

  const renderPrice = (price, maxLen) => {
    const priceArr = [price];
    if (price.length < maxLen) {
      for (let i = 0; i < maxLen - price.length; i++) {
        const spacer = (
          <span key={`spacer-{$i}`} className="invisible">
            0
          </span>
        );
        priceArr.unshift(spacer);
      }
    }

    return priceArr;
  };

  const bestBidOrder = props.me.bids.peek();
  const bestOfferOrder = props.me.offers.peek();

  return (
    <>
      {/* Mobile condensed bid/offer view */}
      <Table size="sm" className="text-center caption-top d-md-none">
        <thead>
          <tr>
            <th>Qty</th>
            <th>Bid</th>
            <th>Offer</th>
            <th>Qty</th>
            <th>Last</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{bestBidOrder && bestBidOrder.qty}</td>
            <td>{bestBidOrder && bestBidOrder.price}</td>
            <td>{bestOfferOrder && bestOfferOrder.price}</td>
            <td>{bestOfferOrder && bestOfferOrder.qty}</td>
            <td>{lastPrice}</td>
          </tr>
        </tbody>
      </Table>

      {/* Desktop 'active trader' view */}
      <Table size="sm" className="text-center caption-top d-none d-md-table">
        <thead>
          <tr>
            <th>Buy Qty</th>
            <th>Bid Size</th>
            <th>Price</th>
            <th>Offer Size</th>
            <th>Sell Qty</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((price, i) => {
            return (
              <tr key={price} className={price == lastPrice ? "me-isLast" : ""}>
                <td>{bidMaps.playerOrdersPriceQtyMap.get(Number(price))}</td>
                <td>{bidMaps.allOrdersPriceQtyMap.get(Number(price))}</td>
                <td>{renderPrice(price, gridNumMaxLen)}</td>
                <td>{offerMaps.allOrdersPriceQtyMap.get(Number(price))}</td>
                <td>{offerMaps.playerOrdersPriceQtyMap.get(Number(price))}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
