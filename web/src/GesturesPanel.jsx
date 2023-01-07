export default function GesturesPanel(props) {

  if( !props.results || !props.results.probs) return null;

  const results = props.results;
  const inputBufferState = results.inputBufferState;

  if (!results.inputBufferState) return null;

  return (

    <table style={{ margin: "0 auto" }}>
      <thead>
        <tr>
          {results.probs.map((prob, i) => {
            const bg = (i === results.arg ?
                        (inputBufferState.inputState === 2 ? "yellow" : "blue") :
                        "white");
            return (
              <th
                key={`head-${i}`}
                style={{background: bg}}
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


      {inputBufferState &&
        <tfoot>
          <td>State: {inputBufferState.inputState}</td>
          <td>Val: {inputBufferState.value}</td>
        </tfoot>
      }


    </table>

  );

};