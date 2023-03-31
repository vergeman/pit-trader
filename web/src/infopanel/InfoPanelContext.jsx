import { createContext, useContext, useReducer, useState } from "react";
import Message from "./Message";
import { messagesReducer, activeTabReducer } from "./InfoPanelReducer.js";
export const InfoPanelContext = createContext(null);

export function useInfoPanel() {
  return useContext(InfoPanelContext);
}

export function InfoPanelProvider(props) {
  const [messages, messagesDispatch] = useReducer(messagesReducer, []);
  const [activeTab, activeTabDispatch] = useReducer(activeTabReducer, "messages");
  const [gameID, setGameID] = useState(props.gameID);


  //reset
  if (props.gameID != gameID) {
    setGameID(props.gameID);
    messagesDispatch({type: Message.Restart});
  }

  return (
    <InfoPanelContext.Provider
      value={{ messages, messagesDispatch, activeTab, activeTabDispatch, gameID }}
    >
      {props.children}
    </InfoPanelContext.Provider>
  );
}


export default InfoPanelProvider;