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
        const spacer = <span key={`spacer-{$i}`}className="invisible">0</span>;
        priceArr.unshift(spacer);
      }
    }

    return priceArr;
  };

  return (
    <Table size="sm" className="text-center caption-top">
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
            <tr key={price} className={price == lastPrice ? "me-isLast": ""}>
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
  );
}
