"use strict";
document.getElementById("submitBtn")?.addEventListener("click", login);
//Hängt Formulardaten an URL
async function login() {
    let formData = new FormData(document.forms[0]);
    let url = "http://localhost:8100";
    let query = new URLSearchParams(formData);
    url = url + "/signin" + "?" + query.toString();
    let serverResponse = await fetch(url);
    let response = await serverResponse.json();
    console.log(response);
    if (response) {
        sessionStorage.setItem("currentUser", response);
        window.location.href = '../Chat/index.html';
    }
    else {
        alert("Falscher Nutzer oder Passwort!");
    }
}
//# sourceMappingURL=index.js.map