namespace HFUChat {
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
  document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
  document.getElementById("newChatBtn")?.addEventListener("click", newChat);
  document.getElementById("createChatBtn")?.addEventListener("click", newConversation);

  // Nutzer Interface
  interface User {
    _id: string;
    vname: string;
    nname: string;
    mail: string;
    konversationIds: [];
  }

  interface Conversation {
    _id: string;
    name: string;
    members: string[];
  }

  interface Message {
    message: string;
    fromId: string;
    fromName: string;
    conversationId: string;
  }

  // Aktueller Nutzer auslesen
  let currentUserId = sessionStorage.getItem("currentUserId");
  let url: string = "http://localhost:8100";
  let modal = document.getElementById("myModal");
  // Instanz aktueller Nutzer
  let currentUser: User;
  let currentConversations: Conversation[];
  let currentConversationId: string;
  let availableUsers: User[];
  let currentMessages: Message[];
  let newMessage: Message = {
    message: "",
    fromId: "",
    fromName: "",
    conversationId: "",
  };

  // Seite hat geladen
  if (currentUserId) {
    window.onload = getCurrentUser;
  } else {
    alert("Nutzer nicht angemeldet!");
    window.location.href = "../index.html";
  }

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
    console.log(currentUser);
    let loggedInUser = document.getElementById("loggedInUser");
    // Namen setzen
    if (loggedInUser) {
      loggedInUser.innerHTML = currentUser.vname + " " + currentUser.nname;
    }
    await getUserConversations();
    await getUsers();
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
    let query: URLSearchParams = new URLSearchParams(<any>{
      currentConversationrId: currentConversationId,
    });
    let apiurl = url + "/getMessages" + "?" + query.toString();
    let serverResponse: Response = await fetch(apiurl);
    currentMessages = await serverResponse.json();
    console.log(currentMessages);
    showMessages();
  }

  async function getUsers(): Promise<void> {
    let apiurl = url + "/getUsers";
    let serverResponse: Response = await fetch(apiurl);
    availableUsers = await serverResponse.json();
    initModalContent();
  }

  async function newConversation(_event: Event): Promise<void> {
    let formData: FormData = new FormData(document.forms[1]);
    if(formData.get("conversationName")){
      let query: URLSearchParams = new URLSearchParams(<any>formData);
      let apiurl =
        url + "/newConversation" + "?" + query.toString() + "&" + currentUser._id;
      let serverResponse: Response = await fetch(apiurl);
      let newConversation = await serverResponse.json();
      getUserConversations();
      showConversations();
      modal.style.display = "none";
    }
    else{
      alert("Bitte gebe dem Chat einen Namen!")
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
      console.log(query.toString());
      let apiurl = url + "/sendMessage" + "?" + query.toString();
      let serverResponse: Response = await fetch(apiurl);
      let addedMessage = await serverResponse.json();
      currentMessages.push(addedMessage);
      showMessages();
      document.getElementById("newMessage").value = "";
    }
  }

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
    }
  }

  function changeConversation(_event: Event): void {
    currentConversationId = (<HTMLDivElement>(
      (<HTMLElement>_event.currentTarget)
    )).getAttribute("id")!;
    getMessages();
  }

  function showConversations(): void {
    let conversationContainer = document.getElementById(
      "conversationContainer"
    );
    if (conversationContainer) {
      conversationContainer.innerHTML = "";
      for (let elem of currentConversations) {
        let conversation: HTMLElement = document.createElement("button");
        conversation.id = elem._id;
        conversation.innerHTML = elem.name;
        conversation.addEventListener("click", changeConversation);
        conversationContainer.appendChild(conversation);
      }
    }
  }

  function newChat(): void {
    modal.style.display = "block";
  }

  function initModalContent(): void {
    for (let elem of availableUsers) {
      let user: HTMLElement = document.createElement("div");
      user.innerHTML = elem.vname + " " + elem.nname;
      let userSelect: HTMLElement = document.createElement("input");
      userSelect.type = "checkbox";
      userSelect.name = elem._id;
      userSelect.id = elem._id;
      user.appendChild(userSelect);
      let usersContainer = document.getElementById("usersContainer");
      if (usersContainer) {
        usersContainer.append(user);
      }
    }
  }

  // Modal functions

  // When the user clicks on <span> (x), close the modal
  let span = document.getElementsByClassName("close")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
