import { GestureDecisionEventState } from "../player/GestureDecisionEvent";

export default function GestureDecisionEvent(props) {
  let text = null;

  const gestureDecisionEvent = props.gestureDecisionEvent || {};
  const state = gestureDecisionEvent.gestureDecisionEventState;
  const action = gestureDecisionEvent.action;
  const market_msg =
    gestureDecisionEvent.state_msg[
      `${GestureDecisionEventState.Active}-${action}`
    ];

  const countdown = (Math.max(0, gestureDecisionEvent.expiry() - Date.now()) / 1000).toFixed(2);



  //none - empty
  if (state === GestureDecisionEventState.None) {
    return <div>No Challenges</div>;
  }

  //active, no match, //lost/win - 'template'
  return (
    <div className="d-flex mt-3">
      <div className="px-3">
        <img id="gestureDecisionEvent-tab-image" src={gestureDecisionEvent.img} alt={gestureDecisionEvent.id} />
      </div>

      <div className="d-flex flex-column justify-content-between px-4">
        {[
          GestureDecisionEventState.Active,
          GestureDecisionEventState.NoMatch,
        ].includes(state) && (
          <div>
            <h4>{market_msg}</h4>
          </div>
        )}

        {[
          GestureDecisionEventState.NoMatch,
          GestureDecisionEventState.Win,
          GestureDecisionEventState.Lost,
        ].includes(state) && (
          <div>
            <h4>{gestureDecisionEvent.state_msg[state]}&nbsp;</h4>
          </div>
        )}

        {state === GestureDecisionEventState.Win && (
          <div>
            <h5>Bonus: ${gestureDecisionEvent.bonus}&nbsp;</h5>
          </div>
        )}

        <div>
          Expires: { countdown }
        </div>
      </div>


    </div>
  );
}
