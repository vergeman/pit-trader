
export default function messagesReducer(messages, action) {

  switch (action.type) {
    case 'add':
    console.log("ADD", action.text);
      return [
        {
          //id?
          text: action.text
        },
        ...messages,
      ];

    default: {
      throw new Error("action doesn't exist", action.type);
    }
  }

}
