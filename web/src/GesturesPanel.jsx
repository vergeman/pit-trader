export default function GesturesPanel(props) {
  if (!props.results || !props.results.probs) return null;

  const results = props.results;
  const gestureBuilder = props.gestureBuilder;
  const records = props.gestureDecision.records.sort(
    (a, b) => a.timestamp < b.timestamp
  );

  const getMeta = (idx) => {
    if (!gestureBuilder) return null;
    return gestureBuilder.meta[idx];
  };

  const buildSortMetaByProb = (probs) => {
    const metas = results.probs.map((prob, i) => {
      const meta = getMeta(i);
      if (!meta) return null;
      meta.prob = prob;
      return meta;
    });

    return metas.sort((a, b) => a.prob < b.prob);
  };

  const metas = buildSortMetaByProb(results.probs).filter(
    (result) => result.prob >= 0.01
  );

  const wrapStyle = {
    height: "300px",
  };

  const tableStyle = {
    margin: "0 auto",
    textAlign: "left",
  };

  const tableHeaderStyle = {
    width: "75px",
  };

  return (
    <div style={wrapStyle} className="gestures-live gestures-prob">
      {/* Current Gesture (probs below might not exceed threshold) */}
      <table style={tableStyle}>
        <caption>Gesture Current</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Type&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Action</th>
            <th style={tableHeaderStyle}>Value&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{results && results.gesture.type}</td>
            <td>{results && results.gesture.action}</td>
            <td>{results && results.gesture.value}</td>
          </tr>
        </tbody>
      </table>

      {/* GestureDecision State: Partial state, waiting for all gestures to
          build action */}
      <table style={tableStyle}>
        <caption>Gesture Decision</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Action</th>
            <th style={tableHeaderStyle}>Qty&nbsp;&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Price&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.gestureDecision.action}</td>
            <td>{props.gestureDecision.qty}</td>
            <td>{props.gestureDecision.price}</td>
          </tr>
        </tbody>
      </table>

      {/* Live Gesture */}
      <table style={tableStyle}>
        <caption>Gesture Probabilities</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Index&nbsp;</th>
            <th style={tableHeaderStyle}>Type&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Action</th>
            <th style={tableHeaderStyle}>Value&nbsp;</th>
            <th style={tableHeaderStyle}>Prob&nbsp;&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {metas.map((element, i) => {
            return (
              <tr key={`gesture-${i}`}>
                <td key={`gesture-index-${i}`}>{element.index}</td>
                <td key={`gesture-type-${i}`}>{element.gestureType}</td>
                <td key={`gesture-action-${i}`}>{element.action}</td>
                <td key={`gesture-value-${i}`}>{element.value}</td>
                <td key={`gesture-prob-${i}`}>{element.prob}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ok can't use orders - orders for cancel, will modify the order but action will be out of sequence */}
      {/* sort by timestamp */}
      {/* Past Orders */}
      <table style={tableStyle}>
        <caption>Past Gestures</caption>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Type&nbsp;&nbsp;</th>
            <th style={tableHeaderStyle}>Qty</th>
            <th style={tableHeaderStyle}>Value&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => {
            return (
              <tr key={`record-${i}`}>
                <td key={`record-action-${i}`}>{record.action}</td>
                <td key={`record-qty-${i}`}>{record.qty}</td>
                <td key={`record-price-${i}`}>{record.price}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
