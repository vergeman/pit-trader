import { GestureDecisionEventState } from "../player/GestureDecisionEvent";
import { createContext, useContext, useReducer } from "react";
import { EventType } from "../player/Event.ts";
import {
  messagesReducer,
  activeTabReducer,
  gestureDecisionEventReducer,
} from "./InfoPanelReducer.js";
export const InfoPanelContext = createContext(null);

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

export function InfoPanelProvider(props) {
  const [messages, messagesDispatch] = useReducer(messagesReducer, []);
  const [activeTab, activeTabDispatch] = useReducer(
    activeTabReducer,
    "messages"
  );
  const [gestureDecisionEvent, gestureDecisionEventDispatch] = useReducer(
    gestureDecisionEventReducer,
    {
      type: EventType.GestureDecisionEvent,
      gestureDecisionEventState: GestureDecisionEventState.None,
    }
  );

  return (
    <InfoPanelContext.Provider
      value={{
        messages,
        messagesDispatch,
        activeTab,
        activeTabDispatch,
        gestureDecisionEvent,
        gestureDecisionEventDispatch,
      }}
    >
      {props.children}
    </InfoPanelContext.Provider>
  );
}

export default InfoPanelProvider;
