"use strict";
document.getElementById("submitBtn")?.addEventListener("click", register);
//Hängt Formulardaten an URL
async function register() {
    let formData = new FormData(document.forms[0]);
    let url = "http://localhost:8100";
    if (formData.get("passwort") == formData.get("passwortwiederholen")) {
        let query = new URLSearchParams(formData);
        url = url + "/register" + "?" + query.toString();
        let serverResponse = await fetch(url);
        let response = await serverResponse.json();
        console.log(response);
        if (response) {
            window.location.href = '../login/index.html';
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