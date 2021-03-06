"use strict";
document.getElementById("submitBtn")?.addEventListener("click", login);
//Hängt Formulardaten an URL
async function login() {
    let formData = new FormData(document.forms[0]);
    let url = "https://hfu-chat.herokuapp.com";
    let query = new URLSearchParams(formData);
    url = url + "/signin" + "?" + query.toString();
    let serverResponse = await fetch(url);
    let response = await serverResponse.json();
    if (response) {
        sessionStorage.setItem("currentUserId", response);
        window.location.href = './Chat/index.html';
    }
    else {
        alert("Falscher Nutzer oder Passwort!");
    }
}
//# sourceMappingURL=index.js.map