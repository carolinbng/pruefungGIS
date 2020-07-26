document.getElementById("submitBtn")?.addEventListener("click", login);
//Hängt Formulardaten an URL
async function login(): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let url: string = "https://hfu-chat.herokuapp.com";
    let query: URLSearchParams = new URLSearchParams(<any>formData);
    url = url + "/signin" + "?" + query.toString();
    let serverResponse: Response = await fetch(url);
    let response: string = await serverResponse.json();
    console.log(response);
    if (response) {
        sessionStorage.setItem("currentUserId", response);
        window.location.href = './Chat/index.html';
    }
    else {
        alert("Falscher Nutzer oder Passwort!");
    }

  
}