export type BoardSize = 9 | 13 | 19;
export type StoneColor = 'black' | 'white' | null;
export type Position = { row: number; col: number };

export interface GameState {
  board: StoneColor[][];
  currentPlayer: StoneColor;
  captures: {
    black: number;
    white: number;
  };
  moveCount: number;
}