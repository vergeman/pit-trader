import { useEffect } from "react";
import { Table } from "react-bootstrap";

export default function MatchingEngineView(props) {
  useEffect(() => {
    console.log("[MatchingEngineView.jsx]: useEffect init");
  }, []);

  if (!props.me || !props.price) return null;

  const { bidMap, bidPriceLabel } = props.me.getSumBids(props.player.id);
  const { offerMap, offerPriceLabel } = props.me.getSumOffers(props.player.id);
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
                    <th>Your Bids</th>
                    <th>Bid Qty</th>
                    <th>Price</th>
                    <th>Ask Qty</th>
                    <th>Your Offers</th>
                </tr>
            </thead>
            <tbody>
                {prices.map((price) => {
                    return (
                        <tr key={price}>
                            <td></td>
                            <td>{bidMap.get(Number(price))}</td>
                            <td>{renderPrice(price, gridNumMaxLen)}</td>
                            <td>{offerMap.get(Number(price))}</td>
                            <td></td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
}
