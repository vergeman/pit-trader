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

  //TODO: add time countdown
  //TODO: trigger bonus in Win

  //none - empty
  if (state === GestureDecisionEventState.None) {
    return <div>No Challenges</div>;
  }

  //active, no match, //lost/win - 'template'
  return (
    <div className="d-flex mt-3">
      <div className="px-3">
        <img src={gestureDecisionEvent.img} alt={gestureDecisionEvent.id} />
      </div>

      <div className="d-flex flex-column justify-content-evenly px-4">
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
      </div>
    </div>
  );
}
