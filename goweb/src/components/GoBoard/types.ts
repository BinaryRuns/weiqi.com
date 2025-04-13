import { type BoardTheme } from "./themes"

export interface GoBoardProps {
  size?: 9 | 13 | 19
  preview?: boolean
  interactive?: boolean
  initialStones?: Array<{ x: number; y: number; color: "black" | "white" }>
  theme?: string
  onPlaceStone?: (x: number, y: number, color: "black" | "white") => void
  className?: string
}

export interface BoardThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export type Stone = {
  x: number
  y: number
  color: "black" | "white"
}

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