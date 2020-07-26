namespace HFUChat {
 // Nutzer Interface
  export interface User {
    _id: string;
    vname: string;
    nname: string;
    mail: string;
    konversationIds: [];
  }

  export interface Conversation {
    _id: string;
    name: string;
    members: string[];
  }

  export interface Message {
    message: string;
    fromId: string;
    fromName: string;
    conversationId: string;
  }
}