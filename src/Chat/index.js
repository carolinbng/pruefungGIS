"use strict";
var HFUChat;
(function (HFUChat) {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
    document.getElementById("newChatBtn")?.addEventListener("click", newChat);
    document.getElementById("createChatBtn")?.addEventListener("click", newConversation);
    document.getElementById("newMessage")?.addEventListener("keyup", enterMessage);
    // Aktueller Nutzer auslesen
    let currentUserId = sessionStorage.getItem("currentUserId");
    let url = "https://hfu-chat.herokuapp.com";
    let modal = document.getElementById("myModal");
    // Aktuelle Daten
    let currentUser;
    let currentConversations;
    let currentConversationId;
    let availableUsers;
    let currentMessages;
    let newMessage = {
        message: "",
        fromId: "",
        fromName: "",
        conversationId: ""
    };
    // Seite hat geladen
    if (currentUserId) {
        window.onload = getCurrentUser;
    }
    else {
        alert("Nutzer nicht angemeldet!");
        window.location.href = "../index.html";
    }
    // Timer Chat aktualisierungs intervall
    let timer = setInterval(getMessages, 3000);
    // Abmelden
    function logout() {
        sessionStorage.clear();
        window.location.href = "../index.html";
    }
    async function getCurrentUser() {
        let query = new URLSearchParams({
            currentUserId: currentUserId,
        });
        let apiurl = url + "/getUserData" + "?" + query.toString();
        let serverResponse = await fetch(apiurl);
        currentUser = await serverResponse.json();
        await getUsers();
        await getUserConversations();
    }
    async function getUserConversations() {
        let query = new URLSearchParams({
            currentUserId: currentUserId,
        });
        let apiurl = url + "/getUserConversations" + "?" + query.toString();
        let serverResponse = await fetch(apiurl);
        currentConversations = await serverResponse.json();
        if (currentConversations.length) {
            currentConversationId = currentConversations[0]._id;
            await getMessages();
        }
        showConversations();
    }
    async function getMessages() {
        if (currentConversationId) {
            let query = new URLSearchParams({
                currentConversationrId: currentConversationId,
            });
            let apiurl = url + "/getMessages" + "?" + query.toString();
            let serverResponse = await fetch(apiurl);
            currentMessages = await serverResponse.json();
            showMessages();
        }
    }
    async function getUsers() {
        let apiurl = url + "/getUsers";
        let serverResponse = await fetch(apiurl);
        availableUsers = await serverResponse.json();
        initModalContent();
    }
    async function newConversation(_event) {
        let formData = new FormData(document.forms[1]);
        if (formData.get("conversationName")) {
            let query = new URLSearchParams(formData);
            let apiurl = url + "/newConversation" + "?" + query.toString() + "&" + currentUser._id;
            let serverResponse = await fetch(apiurl);
            let newConversation = await serverResponse.json();
            getUserConversations();
            showConversations();
            modal.style.display = "none";
        }
        else {
            alert("Bitte gebe dem Chat einen Namen!");
        }
    }
    function enterMessage(_event) {
        if (_event.keyCode === 13) {
            _event.preventDefault();
            console.log("test");
            sendMessage();
        }
    }
    async function sendMessage() {
        let formData = new FormData(document.forms[0]);
        let text = formData.get("newMessage")?.toString();
        if (text && currentUser._id) {
            newMessage.fromId = currentUser._id;
            newMessage.fromName = currentUser.vname + " " + currentUser.nname;
            newMessage.conversationId = currentConversationId;
            newMessage.message = text;
            let query = new URLSearchParams(newMessage);
            let apiurl = url + "/sendMessage" + "?" + query.toString();
            let serverResponse = await fetch(apiurl);
            let addedMessage = await serverResponse.json();
            currentMessages.push(addedMessage);
            showMessages();
        }
        document.getElementById("newMessage").value = "";
        let chatWrapper = document.getElementById("chatWrapper");
        chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }
    // Nachrichten füllen
    function showMessages() {
        let chatContainer = document.getElementById("currentMessages");
        if (chatContainer) {
            chatContainer.innerHTML = "";
            for (let elem of currentMessages) {
                let messageContainer = document.createElement("div");
                let messageContent = document.createElement("p");
                let messageTime = document.createElement("span");
                if (elem.fromId == currentUserId) {
                    messageContainer.className = "message-container darker";
                }
                else {
                    messageContainer.className = "message-container";
                    let messageName = document.createElement("h1");
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
    function changeConversation(_event) {
        let oldActive = document.getElementsByClassName("active");
        currentConversationId = _event.currentTarget.getAttribute("id");
        showConversations();
        getMessages();
    }
    // Konversationen in Nav menu anzeigen
    function showConversations() {
        let conversationContainer = document.getElementById("conversationContainer");
        if (conversationContainer) {
            conversationContainer.innerHTML = "";
            for (let elem of currentConversations) {
                let wrapper = document.createElement("div");
                let conversation = document.createElement("button");
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
                console.log(members);
                for (let elem of members) {
                    let wrapper = document.createElement("div");
                    wrapper.innerHTML = elem + " ●";
                    wrapper.className = "chatMemberWrapper";
                    chatMembers.appendChild(wrapper);
                }
            }
        }
    }
    function newChat() {
        modal.style.display = "block";
    }
    // Modal mit verfügbaren Nutzern füllen
    function initModalContent() {
        for (let elem of availableUsers) {
            let user = document.createElement("div");
            let userSelect = document.createElement("input");
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
})(HFUChat || (HFUChat = {}));
//# sourceMappingURL=index.js.map