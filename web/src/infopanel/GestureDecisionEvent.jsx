import { GestureDecisionEventState } from "../player/GestureDecisionEvent";

export default function GestureDecisionEvent(props) {

  let text = null;
  let img = null;
  let commentary = null;

  switch (props.gestureDecisionEventState) {

    case GestureDecisionEventState.Active:
      text = "Active";
      img = "./test.png";
      break;
    case GestureDecisionEventState.NoMatch:
      text = "Active";
      img = "./test.png";
      commentary = "no match!";
      break;
    case GestureDecisionEventState.Lost:
      text = "You Lose!";
      img = "./test.png";
      break;
    case GestureDecisionEventState.Win:
      text = "You WIN!";
      img = "./test.png";
      break;
    case GestureDecisionEventState.None:
    default:
      text = '';
      img = '';

  }

  return (
    <div>
      {`GestureDecisionEventState: ${props.gestureDecisionEventState}`}
      <h3>{text}</h3>
      <p>{commentary}</p>
    </div>);
}
