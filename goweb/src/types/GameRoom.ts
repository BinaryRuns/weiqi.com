export interface GameRoom {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  players?: string[]; // Optional, if backend provides
}
