import Message from "./Message.js";

export function activeTabReducer(activeTab, action) {
  //console.log("[activeTabReducer]", action);
  switch (action.type) {
    case "select":
      activeTab = action.value;
      return activeTab;
    default: {
      throw new Error("action doesn't exist", action);
    }
  }
}

const populateTemplateString = (template, vars) => {
  for (let i = 1; i <= vars.length; i++) {
    template = template.replaceAll(`\$\{${i}\}`, vars[i - 1]);
  }
  return template;
};

export function messagesReducer(messages, action) {
  let text;
  switch (action.type) {
    case Message.SetPrice:
      text = populateTemplateString(Message.SetPrice, [action.value.price]);

    case Message.SetQty:
      text = populateTemplateString(Message.SetQty, [action.value.qty]);

    default: {
      const text = action.text;
      if (text) {
        return [{ text }, ...messages];
      }
      throw new Error("action doesn't exist", action.type);
    }
  }
}
