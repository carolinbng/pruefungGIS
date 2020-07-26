namespace HFUChat {
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
  document.getElementById("newChatBtn")?.addEventListener("click", newChat);
  document.getElementById("createChatBtn")?.addEventListener("click", newConversation);
  document.getElementById("newMessage")?.addEventListener("keyup", enterMessage);

  // Aktueller Nutzer auslesen
  let currentUserId = sessionStorage.getItem("currentUserId");
  let url: string = "https://hfu-chat.herokuapp.com";
  let modal = document.getElementById("myModal");


  // Aktuelle Daten
  let currentUser: HFUChat.User;
  let currentConversations: HFUChat.Conversation[];
  let currentConversationId: string;
  let availableUsers: HFUChat.User[];
  let currentMessages: HFUChat.Message[];
  let newMessage: HFUChat.Message = {
    message: "",
    fromId: "",
    fromName: "",
    conversationId: ""
  };

  // Seite hat geladen
  if (currentUserId) {
    window.onload = getCurrentUser;
  } else {
    alert("Nutzer nicht angemeldet!");
    window.location.href = "../index.html";
  }

  // Timer Chat aktualisierungs intervall
  let timer = setInterval(getMessages, 3000);

  // Abmelden
  function logout(): void {
    sessionStorage.clear();
    window.location.href = "../index.html";
  }

  async function getCurrentUser(): Promise<void> {
    let query: URLSearchParams = new URLSearchParams(<any>{
      currentUserId: currentUserId,
    });
    let apiurl = url + "/getUserData" + "?" + query.toString();
    let serverResponse: Response = await fetch(apiurl);
    currentUser = await serverResponse.json();
    await getUsers();
    await getUserConversations();
  }


  async function getUserConversations(): Promise<void> {
    let query: URLSearchParams = new URLSearchParams(<any>{
      currentUserId: currentUserId,
    });
    let apiurl = url + "/getUserConversations" + "?" + query.toString();
    let serverResponse: Response = await fetch(apiurl);
    currentConversations = await serverResponse.json();
    if (currentConversations.length) {
      currentConversationId = currentConversations[0]._id;
      await getMessages();
    }
    showConversations();
  }

  async function getMessages(): Promise<void> {
    if (currentConversationId) {
      let query: URLSearchParams = new URLSearchParams(<any>{
        currentConversationrId: currentConversationId,
      });
      let apiurl = url + "/getMessages" + "?" + query.toString();
      let serverResponse: Response = await fetch(apiurl);
      currentMessages = await serverResponse.json();
      showMessages();
    }
  }

  async function getUsers(): Promise<void> {
    let apiurl = url + "/getUsers";
    let serverResponse: Response = await fetch(apiurl);
    availableUsers = await serverResponse.json();
    initModalContent();
  }

  async function newConversation(_event: Event): Promise<void> {
    let formData: FormData = new FormData(document.forms[1]);
    if (formData.get("conversationName")) {
      let query: URLSearchParams = new URLSearchParams(<any>formData);
      let apiurl =
        url + "/newConversation" + "?" + query.toString() + "&" + currentUser._id;
      let serverResponse: Response = await fetch(apiurl);
      let newConversation = await serverResponse.json();
      getUserConversations();
      showConversations();
      modal.style.display = "none";
    }
    else {
      alert("Bitte gebe dem Chat einen Namen!")
    }
  }

  function enterMessage(_event: Event) {
    if (_event.keyCode === 13) {
      _event.preventDefault();
      sendMessage();
    }
  }

  async function sendMessage(): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let text = formData.get("newMessage")?.toString();
    if (text && currentUser._id) {
      newMessage.fromId = currentUser._id;
      newMessage.fromName = currentUser.vname + " " + currentUser.nname;
      newMessage.conversationId = currentConversationId;
      newMessage.message = text;
      let query: URLSearchParams = new URLSearchParams(<any>newMessage);
      let apiurl = url + "/sendMessage" + "?" + query.toString();
      let serverResponse: Response = await fetch(apiurl);
      let addedMessage = await serverResponse.json();
      currentMessages.push(addedMessage);
      showMessages();
    }
    document.getElementById("newMessage").value = "";
    let chatWrapper = document.getElementById("chatWrapper");
    chatWrapper.scrollTop = chatWrapper.scrollHeight;
  }


  // Nachrichten füllen
  function showMessages(): void {
    let chatContainer = document.getElementById("currentMessages");
    if (chatContainer) {
      chatContainer.innerHTML = "";
      for (let elem of currentMessages) {
        let messageContainer: HTMLElement = document.createElement("div");
        let messageContent: HTMLElement = document.createElement("p");
        let messageTime: HTMLElement = document.createElement("span");
        if (elem.fromId == currentUserId) {
          messageContainer.className = "message-container darker";
        } else {
          messageContainer.className = "message-container";
          let messageName: HTMLElement = document.createElement("h1");
          messageName.innerHTML = elem.fromName;
          messageContainer.appendChild(messageName);
        }
        messageTime.className = "time-left";
        messageTime.innerHTML = elem.time?.toString();
        messageContent.innerHTML = elem.message;
        messageContainer.appendChild(messageContent);
        messageContainer.appendChild(messageTime);
        chatContainer.appendChild(messageContainer);
      }
      let chatWrapper = document.getElementById("chatWrapper");
      chatWrapper.scrollTop = chatContainer.scrollHeight;
    }
  }


  // Chat wechseln
  function changeConversation(_event: Event): void {
    let oldActive = document.getElementsByClassName("active");
    currentConversationId = (<HTMLDivElement>(
      (<HTMLElement>_event.currentTarget)
    )).getAttribute("id")!;
    showConversations();
    getMessages();
  }


  // Konversationen in Nav menu anzeigen
  function showConversations(): void {
    let conversationContainer = document.getElementById(
      "conversationContainer"
    );
    if (conversationContainer) {
      conversationContainer.innerHTML = "";
      for (let elem of currentConversations) {
        let wrapper: HTMLElement = document.createElement("div");
        let conversation: HTMLElement = document.createElement("button");
        conversation.id = elem._id;
        conversation.innerHTML = elem.name;
        conversation.className = "conversationBtn";
        if (currentConversationId == elem._id) {
          conversation.className = "conversationBtn active";
        }
        conversation.addEventListener("click", changeConversation);
        wrapper.appendChild(conversation);
        conversationContainer.appendChild(wrapper);
      }
      let chatMembers = document.getElementById("chatMembers");
      // Namen setzen
      let members = [];
      if (chatMembers && currentConversations && availableUsers) {
        for (let elem of currentConversations) {
          if (elem._id == currentConversationId) {
            for (let member of elem.members) {
              for (let user of availableUsers) {
                if (user._id == member) {
                  members.push(user.vname + " " + user.nname);
                }
              }
            }
          }
        }
        chatMembers.innerHTML = "";
        for (let elem of members) {
          let wrapper: HTMLElement = document.createElement("div");
          wrapper.innerHTML = elem + " ●";
          wrapper.className = "chatMemberWrapper"
          chatMembers.appendChild(wrapper);
        }
      }
    }
  }

  function newChat(): void {
    modal.style.display = "block";
  }
  // Modal mit verfügbaren Nutzern füllen
  function initModalContent(): void {
    for (let elem of availableUsers) {
      let user: HTMLElement = document.createElement("div");
      let userSelect: HTMLElement = document.createElement("input");
      userSelect.type = "checkbox";
      userSelect.name = elem._id;
      userSelect.id = elem._id;
      user.appendChild(userSelect);
      user.className = "userList";
      user.innerHTML += elem.vname + " " + elem.nname;
      let userListWrapper = document.getElementById("userListWrapper");
      if (userListWrapper) {
        userListWrapper.append(user);
      }
    }
  }

  // Modal functions
  let span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
