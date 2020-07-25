import * as Http from "http";
import * as url from "url";
import * as Mongo from "mongodb";
import { PassThrough } from "stream";

export namespace ChatServer {

  
  let dbUrl = "mongodb+srv://test_user:tester2105@chatcluster.1wmam.mongodb.net/ChatDatabase?retryWrites=true&w=majority";

  let userData: Mongo.Collection;


  async function connectToDatabase(_url: string): void {
    let options: Mongo.MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
    let mongoClient: Mongo.MongoClient = new Mongo.MongoClient(_url, options);
    await mongoClient.connect();
    userData = mongoClient.db("ChatDatabase").collection("Users");
    if (userData != undefined) {
      console.log("Datenbank verbunden");
    }
  }

  connectToDatabase(dbUrl);

  // Ausgabe in der Konsole, Server startet
  console.log("Starting server");
  // Erstelle Variable port vom Datentyp number. env = Environment = Umgebung. process= liefert Infos zur Umgebung
  // In der Variable port wird der Wert der Umgebungsvariable "PORT" gespeichert.
  let port: number = Number(process.env.PORT);
  // Wenn Umgebungsvariable nicht vorhanden, dann eigene Wertzuweisung; 
  if (!port)
    port = 8100;

  // Einen http Server erstellen
  let server: Http.Server = Http.createServer();
  // Sobald Server eine Anfrage bekommt, wird der handleRequest Funktion aufgerufen
  server.addListener("request", handleRequest);
  // Sobald der Server "zuhört" wird handleListen Funktion aufgerufen
  server.addListener("listening", handleListen);
  // Server hört ab jetzt auf port; Server startet
  server.listen(port);

  // Sobald Funktion aufgerufen wird, gibt die Konsole "Listening" aus.
  function handleListen(): void {
    console.log("Listening");
  }

  async function handleRequest(_request: Http.IncomingMessage, _response: Http.ServerResponse): void {

    const adresse = _request.url;
    let q = url.parse(adresse, true);

    /*Die query Eigenschaft gibt ein Ojekt zurück, dass alle query-string Parameter als Eigenschaften besitzt. So können beliebig gesendete Attribute ausgelesen werden:*/
    let qdata = q.query;

    // Sobald eine Anfrage kommt, wird folgender Inhalt diesem zurückgeschickt:
    // Header für Antwort (Was für eine Art von Inhalt ist unsere Antwort)
    _response.setHeader("content-type", "text/html; charset=utf-8");
    _response.setHeader("Access-Control-Allow-Origin", "*");
    // Man schickt dem Anforderer seine eigene URL zurück
    console.log(q.pathname);

    //Einloggen
    if (q.pathname == "/signin") {
      let userDb = await userData.findOne({"email": qdata["email"]});
      if(userDb){
        if(userDb["passwort"] == qdata["passwort"]){
          let jsonString: string = JSON.stringify(true);
          _response.write(jsonString);
        }
        else{
          let jsonString: string = JSON.stringify(false);
          _response.write(jsonString);
        }
      }
      else{
        let jsonString: string = JSON.stringify(false);
        _response.write(jsonString);
      }
      let dbDaten = await userData.find().toArray();
      _response.write(JSON.stringify(dbDaten));
    }

    //Nutzer Registrierung
    else if (q.pathname == "/register") {
      let userDb = await userData.findOne({"email": qdata["email"]});
      if (!userDb) {
        console.log("return", email);
        userData.insertOne(qdata);
        console.log("Register user", qdata);
        let jsonString: string = JSON.stringify(true);
        _response.write(jsonString);
      }
      else {
        let jsonString: string = JSON.stringify(false);
        _response.write(jsonString);
      }
    
    }

    else {
      _response.write("Was geht?");
    }

    // Ende der Antwort
    _response.end();
  }
}