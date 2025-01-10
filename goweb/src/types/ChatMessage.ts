export interface ChatMessage {
  sender: string;
  senderUsername: string;
  content: string;
  roomId: string;
  type: MessageType;
}

export enum MessageType {
  CHAT = "CHAT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
}
