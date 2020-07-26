"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServer = void 0;
const Http = require("http");
const url = require("url");
const Mongo = require("mongodb");
var ChatServer;
(function (ChatServer) {
    let dbUrl = "mongodb+srv://test_user:tester2105@chatcluster.1wmam.mongodb.net/ChatDatabase?retryWrites=true&w=majority";
    let userData;
    let conversationData;
    let messageData;
    async function connectToDatabase(_url) {
        let options = { useNewUrlParser: true, useUnifiedTopology: true };
        let mongoClient = new Mongo.MongoClient(_url, options);
        await mongoClient.connect();
        userData = mongoClient.db("ChatDatabase").collection("Users");
        conversationData = mongoClient.db("ChatDatabase").collection("Conversations");
        messageData = mongoClient.db("ChatDatabase").collection("Messages");
        if (userData != undefined) {
            console.log("Datenbank verbunden");
        }
    }
    connectToDatabase(dbUrl);
    // Ausgabe in der Konsole, Server startet
    console.log("Starting server");
    // Erstelle Variable port vom Datentyp number. env = Environment = Umgebung. process= liefert Infos zur Umgebung
    // In der Variable port wird der Wert der Umgebungsvariable "PORT" gespeichert.
    let port = Number(process.env.PORT);
    // Wenn Umgebungsvariable nicht vorhanden, dann eigene Wertzuweisung; 
    if (!port)
        port = 8100;
    // Einen http Server erstellen
    let server = Http.createServer();
    // Sobald Server eine Anfrage bekommt, wird der handleRequest Funktion aufgerufen
    server.addListener("request", handleRequest);
    // Sobald der Server "zuhört" wird handleListen Funktion aufgerufen
    server.addListener("listening", handleListen);
    // Server hört ab jetzt auf port; Server startet
    server.listen(port);
    // Sobald Funktion aufgerufen wird, gibt die Konsole "Listening" aus.
    function handleListen() {
        console.log("Listening");
    }
    async function handleRequest(_request, _response) {
        const adresse = _request.url;
        let q = url.parse(adresse, true);
        /*Die query Eigenschaft gibt ein Ojekt zurück, dass alle query-string Parameter als Eigenschaften besitzt. So können beliebig gesendete Attribute ausgelesen werden:*/
        let qdata = q.query;
        // Sobald eine Anfrage kommt, wird folgender Inhalt diesem zurückgeschickt:
        // Header für Antwort (Was für eine Art von Inhalt ist unsere Antwort)
        _response.setHeader("content-type", "application/json");
        _response.setHeader("Access-Control-Allow-Origin", "*");
        // Man schickt dem Anforderer seine eigene URL zurück
        console.log(q.pathname);
        //Einloggen
        if (q.pathname == "/signin") {
            let userDb = await userData.findOne({ "email": qdata["email"] });
            if (userDb) {
                if (userDb["passwort"] == qdata["passwort"]) {
                    let jsonString = JSON.stringify(userDb._id);
                    _response.write(jsonString);
                }
                else {
                    let jsonString = JSON.stringify(false);
                    _response.write(jsonString);
                }
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        //Nutzer Registrierung
        else if (q.pathname == "/register") {
            let userDb = await userData.findOne({ "email": qdata["email"] });
            if (!userDb) {
                let dbReesponse = await userData.insertOne(qdata);
                let usrDb = dbReesponse.ops[0];
                let jsonString = JSON.stringify(usrDb);
                _response.write(jsonString);
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        //Aktueller Nutzer daten
        else if (q.pathname == "/getUserData") {
            if (qdata["currentUserId"]) {
                let currentUserId = qdata["currentUserId"].toString();
                const ObjectID = Mongo.ObjectID;
                const id = new ObjectID(currentUserId);
                let userDb = await userData.findOne({ "_id": id });
                let jsonString = JSON.stringify(userDb);
                _response.write(jsonString);
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        else if (q.pathname == "/getUserConversations") {
            if (qdata["currentUserId"]) {
                let currentUserId = qdata["currentUserId"].toString();
                const ObjectID = Mongo.ObjectID;
                const id = new ObjectID(currentUserId);
                let conDb = await conversationData.find({ "members": id }).toArray();
                let jsonString = JSON.stringify(conDb);
                _response.write(jsonString);
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        else if (q.pathname == "/getUsers") {
            let userDb = await userData.find({}, { projection: { _id: 1, vname: 1, nname: 1 } }).toArray();
            let jsonString = JSON.stringify(userDb);
            _response.write(jsonString);
        }
        else if (q.pathname == "/newConversation") {
            const ObjectID = Mongo.ObjectID;
            let ids = [];
            for (let elem in qdata) {
                if (elem != "conversationName") {
                    const id = new ObjectID(elem);
                    ids.push(id);
                }
            }
            if (qdata["conversationName"] && ids.length) {
                let conversation = {
                    name: qdata["conversationName"],
                    members: ids,
                };
                let dbReesponse = await conversationData.insertOne(conversation);
                let conDb = dbReesponse.ops[0];
                let jsonString = JSON.stringify(conDb);
                _response.write(jsonString);
            }
        }
        else if (q.pathname == "/addUserToConversation") {
            if (qdata["currentConversationrId"] && qdata["currentUserId"]) {
                let currentConversationrId = qdata["currentConversationrId"].toString();
                let currentUserId = qdata["currentUserId"].toString();
                const ObjectID = Mongo.ObjectID;
                const convId = new ObjectID(currentConversationrId);
                const userId = new ObjectID(currentUserId);
                let update = await conversationData.updateOne({ _id: convId }, { $push: { members: userId } });
                let jsonString = JSON.stringify(update);
                _response.write(jsonString);
            }
        }
        else if (q.pathname == "/getMessages") {
            if (qdata["currentConversationrId"]) {
                let currentConversationrId = qdata["currentConversationrId"].toString();
                const ObjectID = Mongo.ObjectID;
                const id = new ObjectID(currentConversationrId);
                let mesDb = await messageData.find({ "conversationId": id }).sort({ time: 1 }).toArray();
                let jsonString = JSON.stringify(mesDb);
                _response.write(jsonString);
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        else if (q.pathname == "/sendMessage") {
            if (qdata) {
                const ObjectID = Mongo.ObjectID;
                qdata["fromId"] = new ObjectID(qdata["fromId"]);
                qdata["conversationId"] = new ObjectID(qdata["conversationId"]);
                qdata["time"] = new Date();
                let dbReesponse = await messageData.insertOne(qdata);
                let mesDb = dbReesponse.ops[0];
                let jsonString = JSON.stringify(mesDb);
                _response.write(jsonString);
            }
            else {
                let jsonString = JSON.stringify(false);
                _response.write(jsonString);
            }
        }
        // Alle nutzer zurück geben
        else if (q.pathname == "/getUsers") {
            let users = await userData.find().toArray();
            for (let x of users) {
                x["passwort"] = "";
                x["passwortwiederholen"] = "";
            }
            let jsonString = JSON.stringify(users);
            _response.write(jsonString);
        }
        else {
            _response.write("Was geht?");
        }
        // Ende der Antwort
        _response.end();
    }
})(ChatServer = exports.ChatServer || (exports.ChatServer = {}));
//# sourceMappingURL=server.js.map