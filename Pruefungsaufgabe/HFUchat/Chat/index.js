"use strict";
var HFUChat;
(function (HFUChat) {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("sendBtn")?.addEventListener("click", send);
    // Aktueller Nutzer auslesen
    let currentUser = sessionStorage.getItem("currentUser");
    let user = {
        id: "",
        vName: "",
        nName: "",
        mail: "",
        konversationIds: []
    };
    function logout() {
        sessionStorage.clear();
        window.location.href = '../Login/index.html';
    }
    async function getUser() {
        let url = "http://localhost:8100";
        let query = new URLSearchParams({ "currentUser": currentUser });
        url = url + "/getUserData" + "?" + query.toString();
        let serverResponse = await fetch(url);
        let response = await serverResponse.json();
        user.vName = response["vname"];
        user.nName = response["nname"];
        user.mail = response["email"];
        user.id = response["_id"];
        console.log(user);
        let loggedInUser = document.getElementById("loggedInUser");
        if (loggedInUser) {
            loggedInUser.innerHTML = user.vName + " " + user.nName;
        }
    }
    async function send() {
        let url = "http://localhost:8100";
        let formData = new FormData(document.forms[1]);
        let message = formData.get("message");
        let query = new URLSearchParams({ formData });
        url = url + "/getUserData" + "?" + query.toString();
        let serverResponse = await fetch(url);
        let response = await serverResponse.json();
        let loggedInUser = document.getElementById("loggedInUser");
        if (loggedInUser) {
            loggedInUser.innerHTML = response["vname"] + " " + response["nname"];
        }
    }
    if (currentUser) {
        window.onload = getUser;
    }
    else {
        window.location.href = '../Login/index.html';
    }
})(HFUChat || (HFUChat = {}));
//# sourceMappingURL=index.js.map