import { useState, useEffect, useCallback } from "react";
import { GestureDecisionEventState } from "../../../lib/event/";

/*
 * GDE has an interval only for ACTIVE / NOMATCH GDE states.
 * LOST / WIN there is no timer (match window over) managed in this component
 * NONE: nothing running
 *
 * interval is managed internally in order to re-render countdown every
 * setInterval.
 *
 * useEffect has state dependency, so a state change to NOMATCH will actually
 * clear and then restart the interval where it left off.
 * For expired (WIN/LOSE) or NONE states, interval will not be triggered,
 * useEffect has no effect.
 */

export default function GestureDecisionEvent(props) {
  const gestureDecisionEvent = props.gestureDecisionEvent;
  const state = gestureDecisionEvent.gestureDecisionEventState;
  const action = gestureDecisionEvent.action;
  const market_msg =
    gestureDecisionEvent.state_msg[
      `${GestureDecisionEventState.ACTIVE}-${action}`
    ];

  const calcCountdown = useCallback(() => {
    return (
      Math.max(0, gestureDecisionEvent.expiry() - Date.now()) / 1000
    ).toFixed(2);
  }, [gestureDecisionEvent]);

  const [countdown, setCountdown] = useState(() => calcCountdown());

  //parent InfoTab component is memoized
  //
  //but to display a countdown we do need to consistently re-render
  //so aim to reduce render calls using setCountdown /setInterval
  useEffect(() => {
    console.log("[GestureDecisionEvent] useEffect", state);
    let interval = null;

    if (
      [
        GestureDecisionEventState.ACTIVE,
        GestureDecisionEventState.NOMATCH,
      ].includes(state)
    ) {

      interval = setInterval(() => {
        const c = calcCountdown();
        setCountdown(c);
      }, 150);
    }

    return () => {
      console.log("[GestureDecisionEvent] cleanup");
      clearInterval(interval);
    };
  }, [calcCountdown, state]);


  /*
    * RENDER
    */

  //none - empty
  if (state === GestureDecisionEventState.NONE) {
    return <div>No Challenges</div>;
  }

  //active, no match, //lost/win - 'template'
  return (
    <div className="d-flex mt-3">
      <div className="px-3">
        <a
          href="https://ttdevelopers.github.io/EverySingleAvatar.html"
          target="_blank"
          rel="noreferrer"
        >
          <img
            id="gestureDecisionEvent-tab-image"
            src={gestureDecisionEvent.img}
            alt={gestureDecisionEvent.id}
          />
        </a>
      </div>

      <div className="d-flex flex-column justify-content-between px-4">
        {[
          GestureDecisionEventState.ACTIVE,
          GestureDecisionEventState.NOMATCH,
        ].includes(state) && (
          <div>
            <h4>{market_msg}</h4>
          </div>
        )}

        {[
          GestureDecisionEventState.NOMATCH,
          GestureDecisionEventState.WIN,
          GestureDecisionEventState.LOST,
        ].includes(state) && (
          <div>
            <h4>{gestureDecisionEvent.state_msg[state]}&nbsp;</h4>
          </div>
        )}

        {state === GestureDecisionEventState.WIN && (
          <div>
            <h5>Bonus: ${gestureDecisionEvent.bonus}&nbsp;</h5>
          </div>
        )}

        <div>Expires: {countdown}</div>
      </div>
    </div>
  );
}
