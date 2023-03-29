import { createContext, useContext, useReducer } from "react";
import messagesReducer from "./MessagesReducer.js";

export const MessagesContext = createContext(null);
export const MessagesDispatchContext = createContext(null);
export function useMessages() {
  return useContext(MessagesContext);
}
export function useMessagesDispatch() {
  return useContext(MessagesDispatchContext);
}

export default function MessagesProvider({ children }) {
  const [messages, dispatch] = useReducer(messagesReducer, []);

  return (
    <MessagesContext.Provider value={messages}>
      <MessagesDispatchContext.Provider value={dispatch}>
        {children}
      </MessagesDispatchContext.Provider>
    </MessagesContext.Provider>
  );
}
