namespace HFUChat {
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("sendBtn")?.addEventListener("click", send);

    // Aktueller Nutzer auslesen
    let currentUser = sessionStorage.getItem("currentUser");

    let user: User = {
        id: "",
        vName: "",
        nName: "",
        mail: "",
        konversationIds: []
    };

    function logout(): void {
        sessionStorage.clear();
        window.location.href = '../Login/index.html';
    }


    async function getUser(): Promise<void> {
        let url: string = "http://localhost:8100";
        let query: URLSearchParams = new URLSearchParams(<any>{"currentUser" : currentUser});
        url = url + "/getUserData" + "?" + query.toString();
        let serverResponse: Response = await fetch(url);    
    
        let response: JSON = await serverResponse.json();

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

    async function send(): Promise<void> {
        let url: string = "http://localhost:8100";
        let formData: FormData = new FormData(document.forms[1]);
        let message = formData.get("message");

        let query: URLSearchParams = new URLSearchParams(<any>{formData});
        url = url + "/getUserData" + "?" + query.toString();
        let serverResponse: Response = await fetch(url);
        let response: string = await serverResponse.json();

    
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
}