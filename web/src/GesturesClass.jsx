export default function GesturesClass(props) {

  if( !props.results || !props.results.probs) return null;

  const results = props.results;

  return (

    <table style={{ margin: "0 auto" }}>
      <thead>
        <tr>
          {results.probs.map((prob, i) => {
            return (
              <th
                key={`head-${i}`}
                style={{
                  background: i === results.arg ? "yellow" : "white",
                }}
              >
                {i}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        <tr>
          {results.probs.map((prob, i) => (
            <td key={`prob-${i}`}>{prob}</td>
          ))}
        </tr>
      </tbody>
    </table>

  );

};