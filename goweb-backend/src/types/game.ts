export type StoneColor = 'black' | 'white' | null;
export type GameStatus = 'waiting' | 'active' | 'finished';

export interface Position {
  x: number;
  y: number;
}

export interface Move {
  player: StoneColor;
  position: Position;
  capturedStones: number;
  timestamp: Date;
}

export interface Game {
  boardState: StoneColor[][];
  currentPlayer: StoneColor;
  players: {
    black: string;
    white: string;
  };
  moves: Move[];
  status: GameStatus;
  result?: {
    winner: StoneColor;
    score: {
      black: number;
      white: number;
    };
  };
  boardSize: number;
  capturedStones: {
    black: number;
    white: number;
  };
}