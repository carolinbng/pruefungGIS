"use strict";
var HFUChat;
(function (HFUChat) {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
    document.getElementById("newChatBtn")?.addEventListener("click", newChat);
    document.getElementById("createChatBtn")?.addEventListener("click", newConversation);
    // Aktueller Nutzer auslesen
    let currentUserId = sessionStorage.getItem("currentUserId");
    let url = "http://localhost:8100";
    let modal = document.getElementById("myModal");
    // Instanz aktueller Nutzer
    let currentUser;
    let currentConversations;
    let currentConversationId;
    let availableUsers;
    let currentMessages;
    let newMessage = {
        message: "",
        fromId: "",
        fromName: "",
        conversationId: "",
    };
    // Seite hat geladen
    if (currentUserId) {
        window.onload = getCurrentUser;
    }
    else {
        alert("Nutzer nicht angemeldet!");
        window.location.href = "../index.html";
    }
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
        console.log(currentUser);
        let loggedInUser = document.getElementById("loggedInUser");
        // Namen setzen
        if (loggedInUser) {
            loggedInUser.innerHTML = currentUser.vname + " " + currentUser.nname;
        }
        await getUserConversations();
        await getUsers();
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
        let query = new URLSearchParams({
            currentConversationrId: currentConversationId,
        });
        let apiurl = url + "/getMessages" + "?" + query.toString();
        let serverResponse = await fetch(apiurl);
        currentMessages = await serverResponse.json();
        console.log(currentMessages);
        showMessages();
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
    async function sendMessage() {
        let formData = new FormData(document.forms[0]);
        let text = formData.get("newMessage")?.toString();
        if (text && currentUser._id) {
            newMessage.fromId = currentUser._id;
            newMessage.fromName = currentUser.vname + " " + currentUser.nname;
            newMessage.conversationId = currentConversationId;
            newMessage.message = text;
            let query = new URLSearchParams(newMessage);
            console.log(query.toString());
            let apiurl = url + "/sendMessage" + "?" + query.toString();
            let serverResponse = await fetch(apiurl);
            let addedMessage = await serverResponse.json();
            currentMessages.push(addedMessage);
            showMessages();
            document.getElementById("newMessage").value = "";
        }
    }
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
        }
    }
    function changeConversation(_event) {
        currentConversationId = _event.currentTarget.getAttribute("id");
        getMessages();
    }
    function showConversations() {
        let conversationContainer = document.getElementById("conversationContainer");
        if (conversationContainer) {
            conversationContainer.innerHTML = "";
            for (let elem of currentConversations) {
                let conversation = document.createElement("button");
                conversation.id = elem._id;
                conversation.innerHTML = elem.name;
                conversation.addEventListener("click", changeConversation);
                conversationContainer.appendChild(conversation);
            }
        }
    }
    function newChat() {
        modal.style.display = "block";
    }
    function initModalContent() {
        for (let elem of availableUsers) {
            let user = document.createElement("div");
            user.innerHTML = elem.vname + " " + elem.nname;
            let userSelect = document.createElement("input");
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
})(HFUChat || (HFUChat = {}));
//# sourceMappingURL=index.js.map