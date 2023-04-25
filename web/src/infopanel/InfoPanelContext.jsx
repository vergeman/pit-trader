import { GestureDecisionEventState } from "../player/GestureDecisionEvent";
import { createContext, useContext, useReducer } from "react";
import {
  messagesReducer,
  activeTabReducer,
  gestureDecisionEventStateReducer,
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
  const [gestureDecisionEventState, gestureDecisionEventStateDispatch] =
    useReducer(
      gestureDecisionEventStateReducer,
      GestureDecisionEventState.None
    );

  return (
    <InfoPanelContext.Provider
      value={{
        messages,
        messagesDispatch,
        activeTab,
        activeTabDispatch,
        gestureDecisionEventState,
        gestureDecisionEventStateDispatch,
      }}
    >
      {props.children}
    </InfoPanelContext.Provider>
  );
}

export default InfoPanelProvider;
