export default function GesturesRecords(props) {

  return (
    <table className="table caption-top table-borderless w-100">
      <caption>Past Gestures</caption>
      <thead>
        <tr>
          <th>Time&nbsp;&nbsp;</th>
          <th>Type&nbsp;&nbsp;</th>
          <th>Qty</th>
          <th>Value&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {props.records.map((record, i) => {
          const d = new Date(record.timestamp);
          return (
            <tr key={`record-${i}`}>
              <td
                key={`record-timestamp-${i}`}
                style={{ minWidth: "100px" }}
              >
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
  );

}