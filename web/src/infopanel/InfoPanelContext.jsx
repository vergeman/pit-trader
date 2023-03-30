import { createContext, useContext, useReducer } from "react";
import { messagesReducer, activeTabReducer } from "./InfoPanelReducer.js";
export const InfoPanelContext = createContext(null);

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

export default function InfoPanelProvider({ children }) {
  const [messages, messagesDispatch] = useReducer(messagesReducer, []);
  const [activeTab, activeTabDispatch] = useReducer(activeTabReducer, "messages");

  return (
    <InfoPanelContext.Provider
      value={{ messages, messagesDispatch, activeTab, activeTabDispatch }}
    >
      {children}
    </InfoPanelContext.Provider>
  );
}
