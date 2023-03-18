import { useEffect } from "react";
import { Table } from "react-bootstrap";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me || !props.price) return null;

  const bidMaps = props.me.getBidMaps(props.player.id);
  const offerMaps = props.me.getOfferMaps(props.player.id);
  const { gridNumMinLen, gridNumMaxLen, prices } = props.me.calcGrid(
    props.price
  );

  const renderPrice = (price, maxLen) => {
    const priceArr = [price];
    if (price.length < maxLen) {
      for (let i = 0; i < maxLen - price.length; i++) {
        const spacer = <span className="invisible">0</span>;
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
        {prices.map((price) => {
          return (
            <tr key={price}>
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
