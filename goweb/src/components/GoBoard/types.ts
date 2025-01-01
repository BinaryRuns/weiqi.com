export type BoardSize = 19 | 13 | 9;

export type StoneColor = 'black' | 'white' | null;

export interface Position {
  x: number;
  y: number;
}

export interface BoardProps {
  size: BoardSize;
  stones: StoneColor[][];
  onIntersectionClick?: (position: Position) => void;
  lastMove?: Position | null;
}

export interface StoneProps {
  color: StoneColor;
  isLastMove?: boolean;
}