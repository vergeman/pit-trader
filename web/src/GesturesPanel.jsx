export default function GesturesPanel(props) {

  if( !props.results || !props.results.probs) return null;

  const results = props.results;
  const inputBufferState = results.inputBufferState;
  const probBuffer = results.probBuffer;

  if (!results.inputBufferState) return null;

  return (

    <table style={{ margin: "0 auto" }}>
      <thead>
        <tr>
          {results.probs.map((prob, i) => {
            const bg = (i === results.argMax ?
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
          <tr>
            <td>State: {inputBufferState.inputState}</td>
            <td>Type: {results && results.gesture.type}</td>
            <td>Action: {results && results.gesture.action}</td>
            <td>Val: {inputBufferState.value}</td>
            <td>Window: {JSON.stringify(probBuffer)} </td>
            <td>Finals: {JSON.stringify(inputBufferState.gestureFinals)} </td>
          </tr>
        </tfoot>
      }


    </table>

  );

};