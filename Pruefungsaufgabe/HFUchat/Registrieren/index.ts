document.getElementById("submitBtn")?.addEventListener("click", register);
//Hängt Formulardaten an URL
async function register(): Promise<void> {
    let formData: FormData = new FormData(document.forms[0]);
    let url: string = "http://localhost:8100";
    if (formData.get("passwort") == formData.get("passwortwiederholen")) {
        let query: URLSearchParams = new URLSearchParams(<any>formData);
        let apiurl = url + "/register" + "?" + query.toString();
        let serverResponse: Response = await fetch(apiurl);
        let response: string = await serverResponse.json();
        console.log("resp",response);
        console.log("asiaso")
        if(response["_id"]){
            let queryAddUser: URLSearchParams = new URLSearchParams(<any>{"currentUserId": response["_id"], "currentConversationrId": "5f1cc8cef570ac54a0703b6f" });
            apiurl = url + "/addUserToConversation" + "?" + queryAddUser.toString();
            let addedToConv: Response = await fetch(apiurl);
            queryAddUser = new URLSearchParams(<any>{"currentUserId": response["_id"], "currentConversationrId": "5f1c985f228aa84da1f7e50b" });
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
