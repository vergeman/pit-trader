import { useEffect } from "react";
import { Table } from "react-bootstrap";

export default function MatchingEngineView(props) {

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

  const bidOfferPriceRow = () => {
    const pricesView = [];
    const numOfferPrices = offerMaps.allOrdersPriceQtyMap.size;
    let bid_idx = 0;
    let offer_idx = numOfferPrices;

    for (let i = 0; i < prices.length; i++) {
      const price = prices[i]; //start high -> low price
      const bidQty = bidMaps.allOrdersPriceQtyMap.get(Number(price));
      const offerQty = offerMaps.allOrdersPriceQtyMap.get(Number(price));

      const bidStyle = bidQty
        ? {
            background: `hsl(150, 41%, ${Math.max(7, 23 - 3 * bid_idx)}%`,
          }
        : { background: "hsl(150, 41%, 7%)" };

      const offerStyle = offerQty
        ? {
            background: `hsl(0, 48%, ${Math.max(8, 24 - 3 * offer_idx)}%)`,
          }
        : { background: "hsl(0, 48%, 8%)" };

      //bid lighten 3%
      if (bidQty) {
        bid_idx++;
      }
      //offer lighten 3%
      if (offerQty) {
        offer_idx--;
      }

      const priceView = (
        <tr key={price} className={price == lastPrice ? "me-isLast" : ""}>
          <td className="me-order">
            {bidMaps.playerOrdersPriceQtyMap.get(Number(price))}
          </td>
          <td className="me-bid" style={bidStyle}>
            {bidQty}
          </td>
          <td className="me-price">{renderPrice(price, gridNumMaxLen)}</td>
          <td className="me-offer" style={offerStyle}>
            {offerQty}
          </td>
          <td className="me-order">
            {offerMaps.playerOrdersPriceQtyMap.get(Number(price))}
          </td>
        </tr>
      );

      pricesView.push(priceView);
    }
    return pricesView;
  };

  return (
    <>
      {/* Mobile condensed bid/offer view */}
      <Table
        size="sm"
        className="text-center table-bordered caption-top d-md-none"
      >
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
            <td className="me-bid">{bestBidOrder && bestBidOrder.price}</td>
            <td className="me-price">
              {bestOfferOrder && bestOfferOrder.price}
            </td>
            <td className="me-offer">{bestOfferOrder && bestOfferOrder.qty}</td>
            <td>{lastPrice}</td>
          </tr>
        </tbody>
      </Table>

      {/* Desktop 'active trader' view */}
      <Table
        size="sm"
        className="text-center table-bordered caption-top d-none d-md-table"
      >
        <thead>
          <tr>
            <th>Buy Qty</th>
            <th>Bid Size</th>
            <th>Price</th>
            <th>Offer Size</th>
            <th>Sell Qty</th>
          </tr>
        </thead>
        <tbody>{bidOfferPriceRow()}</tbody>
      </Table>
    </>
  );
}
