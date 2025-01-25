export interface ChatMessage {
  sender: string;
  senderUsername: string;
  content: string;
  roomId: string;
  type: MessageType;
  timestamp: number;
}

export enum MessageType {
  CHAT = "CHAT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
}
