const getLoanFileLink = async function () {
  // fetch("https://better.com/api/ceapo/hello")
  //   .then((response) => {
  //     if (!response.data) throw Error(response.statusText);

  //     return response.json();
  //   })
  //   .then((json) => setUser(response.data));
  return `https://admin.bettermg.com/oz/borrower-context/account:2650506/259bac06-7628-425b-ab28-62727d8c323b`;
};

const getGPT3Response = async function (context) {
  console.log(`Front list Messages`, Front.listMessages());
  console.log(`Front conversation`, context.conversation);
  const prompt = context.conversation;
  // fetch("https://better.com/api/ceapo/hello", {
  //   method: "POST",
  //   body: prompt,
  // })
  //   .then((response) => {
  //     if (!response.draft_reply) throw Error(response.statusText);

  //     return response.json();
  //   })
  //   .then((json) => createDraft(response.draft_reply))
  //   .catch((e) => {
  //     console.log(`Error`, e);
  //     display messages here
  //   });
  return {
    draft_reply: `I\'m sorry to hear that you were having some difficulty with your application. It looks like the issue stems from your credit score. Currently, the minimum credit score that Better can work with is 620, and it appears that what we pulled falls below that number.`,
  };
};

const getDOM = () => {
  const buttons = document.querySelectorAll("button");

  return buttons;
};

const setEventHandlers = (context) => {
  const [loanFileBtn, gptButton] = getDOM();

  loanFileBtn.addEventListener("click", () => {
    console.log("get loan file", Front);

    getLoanFileLink().then((link) => Front.openUrl(link));
  });

  gptButton.addEventListener("click", () => {
    getGPT3Response(context).then((response) => createDraft(context, response));
  });
};

const createDraft = async function (context, response) {
  console.log("creating draft", context.conversation, response);
  const prompt = context.conversation;

  const draft = await Front.createDraft({
    content: {
      body: response.draft_reply,
      type: "text",
    },
    replyOptions: {
      type: "reply",
      originalMessageId: prompt.id,
    },
  });
};

/* 
  Front - subscribe
  Front uses RxJS model and publishes model changes to
   an Observable (context)
   we subscribe here to changes to properties
   and capture when a new conversation or inbox message
   is selected
*/
Front.contextUpdates.subscribe((context) => {
  switch (context.type) {
    case "noConversation":
      console.log("No conversation selected");
      break;
    case "singleConversation":
      console.log("Selected conversation:", context.conversation);
      break;
    case "multiConversations":
      console.log("Multiple conversations selected", context.conversations);
      break;
    default:
      console.error(`Unsupported context type: ${context.type}`);
      break;
  }
  setEventHandlers(context);
});
