import { GestureDecisionEventState } from "../player/GestureDecisionEvent";

export default function GestureDecisionEvent(props) {
  let text = null;

  const gestureDecisionEvent = props.gestureDecisionEvent || {};
  const state = gestureDecisionEvent.gestureDecisionEventState;
  const action = gestureDecisionEvent.action;
  const msg = gestureDecisionEvent.state_msg[`${state}-${action}`];

  //TODO: add time countdown
  //TODO: trigger bonus in Win
  switch (state) {
    case GestureDecisionEventState.Active:
      text = "Active";
      break;
    case GestureDecisionEventState.NoMatch:
      text = "Active";
      break;
    case GestureDecisionEventState.Lost:
      text = "You Lose!";
      break;
    case GestureDecisionEventState.Win:
      text = "You WIN!";
      break;
    case GestureDecisionEventState.None:
    default:
      text = "";
  }

  //none - empty
  if (state == GestureDecisionEventState.None) {
    return (
      <div>-</div>
    );
  }

  //active, no match, //lost/win - 'template'
  return (
    <div>
      <h3>{text}</h3>

      <img src={gestureDecisionEvent.img} alt={gestureDecisionEvent.id}/>

      <p>{msg}</p>

      {state == GestureDecisionEventState.NoMatch &&
        <p>
          Wrong - try again
        </p>
      }
    </div>
  );
}
