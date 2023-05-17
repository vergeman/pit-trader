import { useEffect } from "react";
import { EventType } from "../../lib/event/Event";
import { useGameContext, GameState } from "../../components/GameContext.jsx";
import { useInfoPanel } from "./infopanel/InfoPanelContext.jsx";
import { Message } from "./infopanel/Message";

export default function useEventManager({ gesture, eventManager }) {
  const infoPanel = useInfoPanel();
  const gameContext = useGameContext();

  useEffect(() => {
    if (
      [GameState.LOSE, GameState.QUIT, GameState.LEVELUP].includes(
        gameContext.state
      )
    )
      return;

    const event = eventManager.generate();
    if (!event) return;

    /*
     * News (common default)
     */

    let msg = { type: Message.NewsEvent, value: event };
    let dispatchFn = infoPanel.messagesDispatch;
    let activeTabDispatchValue = "messages";

    /*
     * GestureDecisionEvent / challenge (one time init)
     */

    if (event && event.type == EventType.GESTUREDECISION) {
      // gestureDecisionEvent calls dispatchHandler in
      // GestureDecisionEvent:onSubmitOrder(). Intercept a typical
      // order and test for match instead of submitting to MatchingEngine.
      //
      // we set dispatchHandler to send messages to allow access to infoPanel
      // dispatch. GestureDecisionEvents are a bit more complicated; have
      // states themselves vs straightforward news event.
      const dispatchHandler = (msg, tabName = null) => {
        infoPanel.gestureDecisionEventDispatch(msg);

        if (tabName) {
          infoPanel.activeTabDispatch({
            type: "select",
            value: tabName,
          });
        }
      };

      //replace config
      event.setDispatchHandler(dispatchHandler);

      msg = {
        type: EventType.GESTUREDECISION,
        value: event,
      };

      activeTabDispatchValue = "gesture-decision-event";
      dispatchFn = infoPanel.gestureDecisionEventDispatch;
    }

    /*
     * Execute Event, Send Messages
     */
    eventManager.executeEvent();

    infoPanel.activeTabDispatch({
      type: "select",
      value: activeTabDispatchValue,
    });

    dispatchFn(msg);
  }, [gesture]);
}
