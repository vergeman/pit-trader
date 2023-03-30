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
  //TODO: remove demo Button reducer to remove action.text
  //TODO: add msg type once we get a better idea what's being sent
  let text;
  switch (action.type) {
    case Message.SetPrice:
      text = populateTemplateString(Message.SetPrice, action.value);
      break;
    case Message.SetQty:
      text = populateTemplateString(Message.SetQty, action.value);
      break;
    case "add":
      text = action.text;
      break;
    default: {
      console.error("action doesn't exist", action);
      return messages;
    }
  }
  return [{ text }, ...messages];
}
