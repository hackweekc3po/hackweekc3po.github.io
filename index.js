const getLoanFileLink = async function (messages) {
  fetch(`https://admin.bettermg.com/api/ceapo/lookup?email=bblack@better.com`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      console.log(json);
    });
  //return `https://admin.bettermg.com/oz/borrower-context/account:2650506/259bac06-7628-425b-ab28-62727d8c323b`;
};

/**
 * Call CEA3PO BE service with relevant prompt
 * @param {*} messages
 */
const getGPT3Response = function (messages) {
  hideErrorState();
  console.log(`returning mock response...`, formatPrompt(messages));

  fetch("https://better.com/api/ceapo/get_draft_reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formatPrompt(messages)),
  })
    .then((response) => {
      const json = response.json();
      const { draft_reply } = json;

      console.log(`response`, json);
      if (draft_reply) {
        createDraft(formatCompletion(draft_reply, messages));
      } else {
        showErrorState();
      }
    })
    .catch((e) => {
      console.log(`Error`, e);
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

const getDOMButtons = () => {
  const buttons = document.querySelectorAll("button");

  return buttons;
};

const hideErrorState = () => {
  const errorBox = document.querySelector(".error-messages");
  errorBox.classList.add("error-hidden");
};

const showErrorState = () => {
  const errorBox = document.querySelector(".error-messages");
  errorBox.classList.remove("error-hidden");
};

const formatCompletion = (response, messages) => {
  return {
    messageId: getCurrentMessageId(messages),
    draft_reply: response.draft_reply,
  };
};

const stripHtml = (html) => {
  let doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const mapParticipant = (thread_status) => {
  const mapping = {
    "outbound": "staff",
    "inbound": "customer"
  }

  return mapping[thread_status];
};

const formatPrompt = (messages) => {
  return messages.results.map((message) => {
    return {
      sender: mapParticipant(message.status),
      body: stripHtml(message.content.body),
    };
  });
};

const getCurrentMessageId = (messages) => {
  const { results } = messages;
  return results[0].id;
};

const setEventHandlers = () => {
  const [loanFileBtn, gptButton] = getDOMButtons();

  loanFileBtn.addEventListener("click", () => {
    console.log("get loan file", Front);

    getLoanFileLink().then((link) => Front.openUrl(link));
  });

  gptButton.addEventListener("click", () => {
    Front.listMessages()
      .then((messages) => {
        console.log(`Front list Messages`, messages);
        getGPT3Response(messages);
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
