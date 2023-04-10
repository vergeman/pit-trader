import { useContext, createContext, useState } from "react";
export const GlobalContext = createContext(null);

/*
 * GlobalContext.Provider:
 * for variables repeatedly used in disparate settings
 *
 * isDebug mode: set by params ?debug=true
 */
export function useGlobalContext() {
  return useContext(GlobalContext);
}

export function GlobalContextProvider(props) {
  const params = new URLSearchParams(window.location.search);
  const isDebugParamTrue = params.get("debug") === "true";

  const [isDebug, setIsDebug] = useState(isDebugParamTrue);

  return (
    <GlobalContext.Provider value={{ isDebug }}>
      {props.children}
    </GlobalContext.Provider>
  );
}

export default GlobalContextProvider;
