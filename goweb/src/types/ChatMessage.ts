export interface ChatMessage {
  sender: string;
  content: string;
  roomId: string;
  type: MessageType;
}

export enum MessageType {
  CHAT = "CHAT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
}
