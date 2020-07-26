"use strict";
document.getElementById("submitBtn")?.addEventListener("click", register);
//Hängt Formulardaten an URL
async function register() {
    let formData = new FormData(document.forms[0]);
    let url = "https://hfu-chat.herokuapp.com";
    if (formData.get("passwort") == formData.get("passwortwiederholen")) {
        let query = new URLSearchParams(formData);
        let apiurl = url + "/register" + "?" + query.toString();
        let serverResponse = await fetch(apiurl);
        let response = await serverResponse.json();
        if (response["_id"]) {
            let queryAddUser = new URLSearchParams({ "currentUserId": response["_id"], "currentConversationrId": "5f1cc8cef570ac54a0703b6f" });
            apiurl = url + "/addUserToConversation" + "?" + queryAddUser.toString();
            let addedToConv = await fetch(apiurl);
            queryAddUser = new URLSearchParams({ "currentUserId": response["_id"], "currentConversationrId": "5f1c985f228aa84da1f7e50b" });
            apiurl = url + "/addUserToConversation" + "?" + queryAddUser.toString();
            addedToConv = await fetch(apiurl);
        }
        if (response) {
            window.location.href = '../index.html';
        }
        else {
            alert("Nutzer existiert bereits!");
        }
    }
    else {
        alert("Passwörter stimmen nicht überein!");
    }
}
//# sourceMappingURL=index.js.map