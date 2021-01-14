const getLoanFileLink = async function () {
  // fetch("https://better.com/api/ceapo/hello")
  //   .then((response) => {
  //     if (!response.data) throw Error(response.statusText);

  //     return response.json();
  //   })
  //   .then((json) => setUser(response.data));
  return `https://admin.bettermg.com/oz/borrower-context/account:2650506/259bac06-7628-425b-ab28-62727d8c323b`;
};

/**
 * Call CEA3PO BE service with relevant prompt
 * @param {*} messages
 */
const getGPT3Response = async function (messages) {
  console.log(`returning mock response...`, formatPrompt(messages));
  // TODO: format prompt sent to BE to include entire thread of messages

  fetch("https://better.com/api/ceapo/get_draft_reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: formatPrompt(messages),
  })
    .then((response) => {
      console.log(`response`, response);
      return formatCompletion(response.json(), messages);
    })
    .catch((e) => {
      console.log(`Error`, e);
      //display messages here
    });

  //   return {
  //     messageId: getCurrentMessageId(messages),
  //     draft_reply: `I\'m sorry to hear that you were having some difficulty with your application. It looks like the issue stems from your credit score. Currently, the minimum credit score that Better can work with is 620, and it appears that what we pulled falls below that number.`,
  //   };
};

// const getFrontListMessages = async function (context) {
//   console.log(`Front conversation`, context.conversation);

//   // draft reply from BE response
//   Front.listMessages()
//     .then((messages) => {
//       console.log(`Front list Messages`, messages);
//       const completion = getGPT3Response(messages);
//       console.log(`Here is completion`, completion);
//       return completion;
//     })
//     .catch((e) => {
//       console.log(`Front unable to return List messages`, e);
//     });
// };

const getDOM = () => {
  const buttons = document.querySelectorAll("button");

  return buttons;
};

const formatCompletion = (response, messages) => {
  return {
    messageId: getCurrentMessageId(messages),
    draft_reply: response.draft_reply,
  };
};

const formatPrompt = (messages) => {
  return messages.results.map((thread) => {
    return {
      sender: thread.status === "outbound" ? "staff" : "borrower",
      body: thread.content.body,
    };
  });
};

const getCurrentMessageId = (messages) => {
  const { results } = messages;
  return results[0].id;
};

const setEventHandlers = () => {
  const [loanFileBtn, gptButton] = getDOM();

  loanFileBtn.addEventListener("click", () => {
    console.log("get loan file", Front);

    getLoanFileLink().then((link) => Front.openUrl(link));
  });

  gptButton.addEventListener("click", () => {
    Front.listMessages()
      .then((messages) => {
        console.log(`Front list Messages`, messages);
        getGPT3Response(messages).then((messages) => {
          createDraft(messages);
        });
      })
      .catch((e) => {
        console.log(`Front unable to return List messages`, e);
      });
  });
};

const createDraft = function (completion = {}) {
  if (!Object.keys(completion).length) return;
  const { messageId, draft_reply } = completion;
  console.log("creating draft", completion);

  Front.createDraft({
    content: {
      body: draft_reply,
      type: "text",
    },
    replyOptions: {
      type: "reply",
      originalMessageId: messageId,
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
// Front.contextUpdates.subscribe((context) => {
//   switch (context.type) {
//     case "noConversation":
//       console.log("No conversation selected");
//       break;
//     case "singleConversation":
//       console.log("Selected conversation:", context.conversation);
//       break;
//     case "multiConversations":
//       console.log("Multiple conversations selected", context.conversations);
//       break;
//     default:
//       console.error(`Unsupported context type: ${context.type}`);
//       break;
//   }
// });

setEventHandlers();
