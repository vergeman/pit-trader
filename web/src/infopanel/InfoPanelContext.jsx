import { createContext, useContext, useReducer, useState } from "react";
import { messagesReducer, activeTabReducer } from "./InfoPanelReducer.js";
export const InfoPanelContext = createContext(null);

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

export function InfoPanelProvider(props) {
  const [messages, messagesDispatch] = useReducer(messagesReducer, []);
  const [activeTab, activeTabDispatch] = useReducer(activeTabReducer, "messages");

  return (
    <InfoPanelContext.Provider
      value={{ messages, messagesDispatch, activeTab, activeTabDispatch }}
    >
      {props.children}
    </InfoPanelContext.Provider>
  );
}


export default InfoPanelProvider;