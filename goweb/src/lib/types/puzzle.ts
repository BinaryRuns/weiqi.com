export type PuzzleDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type PuzzleCategory = 'life-and-death' | 'tesuji' | 'endgame' | 'opening';

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  difficulty: PuzzleDifficulty;
  category: PuzzleCategory;
  boardSize: 9 | 13 | 19;
  initialPosition: string[][];
  solution: string[][];
  createdAt: string;
  likes: number;
}