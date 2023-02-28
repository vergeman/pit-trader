export default function GesturesPanel(props) {
  if (!props.results) return null;

  const results = props.results;
  const probs = results.probs || [];
  const gestureBuilder = props.gestureBuilder;
  const records = props.gestureDecision.records.sort(
    (a, b) => a.timestamp < b.timestamp
  );

  const getMeta = (idx) => {
    if (!gestureBuilder) return null;
    return gestureBuilder.meta[idx];
  };

  const buildSortMetaByProb = (probs) => {
    const metas = probs.map((prob, i) => {
      const meta = getMeta(i);
      if (!meta) return {prob: 0};
      meta.prob = prob;
      return meta;
    });

    return metas.sort((a, b) => a.prob < b.prob);
  };

  const metas = buildSortMetaByProb(probs).filter(
    (result) => result.prob >= 0.01
  );

  const wrapStyle = {
    height: "300px",
    display: "flex",
    justifyContent: "center",
  };

  const tableStyle = {
    margin: "0 auto",
    textAlign: "left",
  };

  const tableHeaderStyle = {
    width: "75px",
  };

  return (
    <div style={wrapStyle}>
      <div className="gestures-current gestures-decision gestures-prob">
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
      </div>

      {/* Past Orders */}
      <div className="gestures-records">
        <table style={tableStyle}>
          <caption>Past Gestures</caption>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Time&nbsp;&nbsp;</th>
              <th style={tableHeaderStyle}>Type&nbsp;&nbsp;</th>
              <th style={tableHeaderStyle}>Qty</th>
              <th style={tableHeaderStyle}>Value&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => {
              const d = new Date(record.timestamp);
              return (
                <tr key={`record-${i}`}>
                  <td key={`record-timestamp-${i}`} style={{minWidth: '100px'}}>
                    {d.toLocaleTimeString()}
                  </td>
                  <td key={`record-action-${i}`}>{record.action}</td>
                  <td key={`record-qty-${i}`}>{record.qty}</td>
                  <td key={`record-price-${i}`}>{record.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
