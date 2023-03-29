/* Live Gesture */
export default function GesturesLive(props) {
  if (!props.isDebug) return null;

  const gestureBuilder = props.gestureBuilder;

  const getMeta = (idx) => {
    if (!gestureBuilder) return null;
    return gestureBuilder.meta[idx];
  };

  const buildSortMetaByProb = (probs) => {
    const metas = probs.map((prob, i) => {
      const meta = getMeta(i);
      if (!meta) return { prob: 0 };
      meta.prob = prob;
      return meta;
    });

    return metas.sort((a, b) => a.prob < b.prob);
  };

  const metas = buildSortMetaByProb(props.probs).splice(0,3);

  return (
    <table className="table caption-top table-borderless w-100">
      <caption>Gesture Probabilities</caption>
      <thead>
        <tr>
          <th>Index&nbsp;</th>
          <th>Type&nbsp;&nbsp;</th>
          <th>Action</th>
          <th>Value&nbsp;</th>
          <th>Prob&nbsp;&nbsp;</th>
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
  );
}
