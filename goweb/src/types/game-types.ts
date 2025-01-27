import { List } from "postcss/lib/list";

export interface GameState {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    userId: string;
    userName: string;
    color: string;
  }>;
  boardSize: BoardSize;
  stones: StoneColor[][];
  blackTime: number;
  whiteTime: number;
  timeControl: TimeControl;
  currentPlayerColor: string;
}

export type StoneColor = "black" | "white" | null;

export interface GameStateResponse {
  roomId: string;
  roomName: string;
  maxPlayers: number;
  currentPlayers: number;
  players: Array<{
    userId: string;
    userName: string;
    color: string;
  }>;
  boardSize: BoardSize;
  stones: StoneColor[][];
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

export type BoardSize = 9 | 13 | 19;

export interface Stone {
  x: number;
  y: number;
  color: "black" | "white";
}

export interface GameTimer {
  blackTime: number;
  whiteTime: number;
}

export interface Player {
  userId: string;
  userName: string;
  color: "black" | "white";
  timeRemaining: number;
}

export interface RoomEvent {
  action: string;
  userId: string;
  gameRoom: GameStateResponse;
}

export interface GameSound {
  color: string;
  type: string;
}

export interface GameResign {
  resigningPlayer: string;
  winner: string;
}
