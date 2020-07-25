export interface User {
    id: string;
    vName: string;
    nName: string;
    mail: string;
    passwort: string;
    konversationIds: Konversation[];
}

export interface Konversation {
    id: string;
    nachrichten: Nachricht[];
    teilnehmer: string[];
}


export interface Nachricht {
    id: string;
    inhalt: string;
}