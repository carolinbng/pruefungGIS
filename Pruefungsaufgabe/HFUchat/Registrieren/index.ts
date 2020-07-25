document.getElementById("submitBtn")?.addEventListener("click", submit);
//Hängt Formulardaten an URL
async function submit(): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let url: string = "http://localhost:8100";
    if (formData.get("passwort") == formData.get("passwortwiederholen")){
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        url = url + "/register" + "?" + query.toString();
        let serverResponse: Response = await fetch(url);
        let response: string = await serverResponse.json();
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