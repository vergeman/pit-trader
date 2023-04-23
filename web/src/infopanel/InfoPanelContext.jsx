import { EventState } from "../player/Event";
import { createContext, useContext, useReducer, useState } from "react";
import { messagesReducer, activeTabReducer, eventStateReducer } from "./InfoPanelReducer.js";
export const InfoPanelContext = createContext(null);

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

export function InfoPanelProvider(props) {
  const [messages, messagesDispatch] = useReducer(messagesReducer, []);
  const [activeTab, activeTabDispatch] = useReducer(activeTabReducer, "messages");
  const [eventState, eventStateDispatch] = useReducer(eventStateReducer, EventState.None);

  return (
    <InfoPanelContext.Provider
      value={{ messages, messagesDispatch, activeTab, activeTabDispatch, eventState, eventStateDispatch }}
    >
      {props.children}
    </InfoPanelContext.Provider>
  );
}


export default InfoPanelProvider;