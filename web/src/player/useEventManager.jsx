import { useState, useEffect } from "react";
import { EventType } from "./Event";
import { useGameContext, GameState } from "../GameContext.jsx";
import { useInfoPanel } from "../infopanel/InfoPanelContext.jsx";
import { Message } from "../infopanel/Message";

export default function useEventManager({ gesture, eventManager }) {
  const infoPanel = useInfoPanel();
  const gameContext = useGameContext();
  //const [event, setEvent] = useState()

  useEffect(() => {
    if (
      [GameState.LOSE, GameState.QUIT, GameState.LEVELUP].includes(
        gameContext.state
      )
    )
      return;

    const event = eventManager.generate();

    //issue: we do need to poll so can't just return
    if (!event) return;

    console.log("[CameraGesture] EventManager");

    //GestureDecisionEvent - aka challenge
    //one time init
    if (event && event.type == EventType.GESTUREDECISION) {
      console.log("[CameraGesture] EventManager EventType.GESTUREDECISION");

      event.dispatchHandler = (msg, tabName = null) => {
        infoPanel.gestureDecisionEventDispatch(msg);

        if (tabName) {
          infoPanel.activeTabDispatch({
            type: "select",
            value: tabName,
          });
        }
      };

      //initial active state
      console.log("[CameraGesture]", event);
      eventManager.executeEvent();
      const msg = {
        type: EventType.GESTUREDECISION,
        value: event,
      };

      infoPanel.activeTabDispatch({
        type: "select",
        value: "gesture-decision-event",
      });

      infoPanel.gestureDecisionEventDispatch(msg);
    }

    /*
     * News
     */

    if (event && event.type == EventType.NEWS) {
      eventManager.executeEvent();
      //news
      const msg = { type: Message.NewsEvent, value: event };
      infoPanel.messagesDispatch(msg);

      //cleanup?
      // return () => {
      // }
    }
  }, [gesture]);

  //return state?
}
