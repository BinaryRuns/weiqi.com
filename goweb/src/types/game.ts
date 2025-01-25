export interface GameRoomDTO {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    playerId: string;
    userName: string;
    color: string;
  }>;
  boardSize: number;
  stones: Array<Array<"black" | "white" | null>>;
  blackTime: number;
  whiteTime: number;
  timeControl: TimeControl;
  currentPlayerColor: string;
}

export interface TimeControl {
  type: "fischer" | "byoyomi" | "simple";
  initialTime: number;
  increment?: number;
  periods?: number;
}

export interface StonePosition {
  x: number;
  y: number;
  color: "black" | "white";
}

export type BoardSize = {
  label: string;
  size: number;
};
