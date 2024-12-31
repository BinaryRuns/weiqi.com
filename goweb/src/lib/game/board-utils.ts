import { BoardSize, StoneColor, Position, GameState } from '@/lib/types/go';

export function createEmptyBoard(size: BoardSize): StoneColor[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

export function isValidMove(
  board: StoneColor[][],
  position: Position,
  color: StoneColor
): boolean {
  if (!position || position.row < 0 || position.col < 0) return false;
  if (position.row >= board.length || position.col >= board.length) return false;
  if (board[position.row][position.col]) return false;
  
  return true;
}

export function getInitialGameState(size: BoardSize): GameState {
  return {
    board: createEmptyBoard(size),
    currentPlayer: 'black',
    captures: {
      black: 0,
      white: 0
    },
    moveCount: 0
  };
}