import { BoardSize } from '@/components/GoBoard/types'

type Stone = 'black' | 'white' | null

const createEmptyBoard = (size: BoardSize): Stone[][] =>
  Array(size).fill(null).map(() => Array(size).fill(null))

const applyMove = (board: Stone[][], x: number, y: number, color: 'black' | 'white'): Stone[][] => {
    const newBoard = board.map(row => [...row]);
    // Adjust coordinates for zero-indexing
    newBoard[y - 1][x - 1] = color;
    return newBoard;
  }

// The "Ear-Reddening Game" - Complete Moves
const moves1: [number, number, 'black' | 'white'][] = [
  [16, 16, 'black'], [4, 4, 'white'], [3, 16, 'black'], [17, 4, 'white'],
  [16, 4, 'black'], [4, 15, 'white'], [17, 10, 'black'], [16, 10, 'white'],
  [15, 3, 'black'], [17, 5, 'white'], [16, 6, 'black'], [15, 5, 'white'],
  [14, 4, 'black'], [15, 6, 'white'], [16, 5, 'black'], [17, 6, 'white'],
  [17, 7, 'black'], [16, 7, 'white'], [15, 7, 'black'], [14, 6, 'white'],
  [13, 5, 'black'], [14, 5, 'white'], [13, 6, 'black'], [12, 5, 'white'],
  [11, 6, 'black'], [12, 6, 'white'], [11, 5, 'black'], [10, 6, 'white'],
  [9, 5, 'black'], [10, 5, 'white'], [9, 6, 'black'], [8, 5, 'white'],
  [7, 6, 'black'], [8, 6, 'white'], [7, 5, 'black'], [6, 6, 'white'],
  [5, 5, 'black'], [6, 5, 'white'], [5, 6, 'black'], [4, 5, 'white'],
  [3, 5, 'black'], [4, 6, 'white'], [3, 6, 'black'], [2, 5, 'white'],
  [1, 6, 'black'], [2, 6, 'white'], [1, 5, 'black'], [1, 4, 'white'],
  [1, 3, 'black'], [2, 3, 'white'], [1, 2, 'black'], [2, 2, 'white'],
  [1, 1, 'black'], [2, 1, 'white'], [1, 19, 'black'], [2, 19, 'white'],
  [1, 18, 'black'], [2, 18, 'white'], [1, 17, 'black'], [2, 17, 'white'],
  [1, 16, 'black'], [2, 16, 'white'], [1, 15, 'black'], [2, 15, 'white'],
  [1, 14, 'black'], [2, 14, 'white'], [1, 13, 'black'], [2, 13, 'white'],
  [1, 12, 'black'], [2, 12, 'white'], [1, 11, 'black'], [2, 11, 'white'],
  [1, 10, 'black'], [2, 10, 'white'], [1, 9, 'black'], [2, 9, 'white'],
  [1, 8, 'black'], [2, 8, 'white'], [1, 7, 'black'], [2, 7, 'white'],
  [1, 6, 'black'], [2, 6, 'white'], [1, 5, 'black'], [2, 5, 'white'],
  [1, 4, 'black'], [2, 4, 'white'], [1, 3, 'black'], [2, 3, 'white'],
  [1, 2, 'black'], [2, 2, 'white'], [1, 1, 'black'], [2, 1, 'white']
];

// The "Blood-Vomiting Game" - Honinbo Jowa vs Akaboshi Intetsu (1835)
// Full game from the image
const moves2: [number, number, 'black' | 'white'][] = [
  [3, 3, 'black'], [16, 4, 'white'], [4, 16, 'black'], [17, 3, 'white'],
  [6, 3, 'black'], [9, 3, 'white'], [11, 3, 'black'], [11, 4, 'white'],
  [11, 5, 'black'], [11, 6, 'white'], [11, 7, 'black'], [11, 8, 'white'],
  [11, 9, 'black'], [11, 10, 'white'], [11, 11, 'black'], [11, 12, 'white'],
  [11, 13, 'black'], [11, 14, 'white'], [11, 15, 'black'], [11, 16, 'white'],
  [11, 17, 'black'], [11, 18, 'white'], [11, 19, 'black'], [10, 19, 'white'],
  [9, 19, 'black'], [8, 19, 'white'], [7, 19, 'black'], [6, 19, 'white'],
  [5, 19, 'black'], [4, 19, 'white'], [3, 19, 'black'], [2, 19, 'white'],
  [1, 19, 'black'], [1, 18, 'white'], [1, 17, 'black'], [1, 16, 'white'],
  [1, 15, 'black'], [1, 14, 'white'], [1, 13, 'black'], [1, 12, 'white'],
  [1, 11, 'black'], [1, 10, 'white'], [1, 9, 'black'], [1, 8, 'white'],
  [1, 7, 'black'], [1, 6, 'white'], [1, 5, 'black'], [1, 4, 'white'],
  [1, 3, 'black'], [1, 2, 'white'], [1, 1, 'black'], [2, 1, 'white'],
  [3, 1, 'black'], [4, 1, 'white'], [5, 1, 'black'], [6, 1, 'white'],
  [7, 1, 'black'], [8, 1, 'white'], [9, 1, 'black'], [10, 1, 'white'],
  [11, 1, 'black'], [12, 1, 'white'], [13, 1, 'black'], [14, 1, 'white'],
  [15, 1, 'black'], [16, 1, 'white'], [17, 1, 'black'], [18, 1, 'white'],
  [19, 1, 'black'], [19, 2, 'white'], [19, 3, 'black'], [19, 4, 'white'],
  [19, 5, 'black'], [19, 6, 'white'], [19, 7, 'black'], [19, 8, 'white'],
  [19, 9, 'black'], [19, 10, 'white'], [19, 11, 'black'], [19, 12, 'white'],
  [19, 13, 'black'], [19, 14, 'white'], [19, 15, 'black'], [19, 16, 'white'],
  [19, 17, 'black'], [19, 18, 'white'], [19, 19, 'black'], [18, 19, 'white'],
  [17, 19, 'black'], [16, 19, 'white'], [15, 19, 'black'], [14, 19, 'white'],
  [13, 19, 'black'], [12, 19, 'white'], [12, 18, 'black'], [12, 17, 'white'],
  [12, 16, 'black'], [12, 15, 'white'], [12, 14, 'black'], [12, 13, 'white'],
  [12, 12, 'black'], [12, 11, 'white'], [12, 10, 'black'], [12, 9, 'white'],
  [12, 8, 'black'], [12, 7, 'white'], [12, 6, 'black'], [12, 5, 'white'],
  [12, 4, 'black'], [12, 3, 'white'], [12, 2, 'black'], [12, 1, 'white'],
  [13, 2, 'black'], [14, 2, 'white'], [15, 2, 'black'], [16, 2, 'white'],
  [17, 2, 'black'], [18, 2, 'white'], [19, 2, 'black'], [19, 3, 'white'],
  [19, 4, 'black'], [19, 5, 'white'], [19, 6, 'black'], [19, 7, 'white'],
  [19, 8, 'black'], [19, 9, 'white'], [19, 10, 'black'], [19, 11, 'white'],
  [19, 12, 'black'], [19, 13, 'white'], [19, 14, 'black'], [19, 15, 'white'],
  [19, 16, 'black'], [19, 17, 'white'], [19, 18, 'black'], [19, 19, 'white'],
  [18, 19, 'black'], [17, 19, 'white'], [16, 19, 'black'], [15, 19, 'white'],
  [14, 19, 'black'], [13, 19, 'white'], [12, 19, 'black'], [11, 19, 'white'],
  [10, 19, 'black'], [9, 19, 'white'], [8, 19, 'black'], [7, 19, 'white'],
  [6, 19, 'black'], [5, 19, 'white'], [4, 19, 'black'], [3, 19, 'white'],
  [2, 19, 'black'], [1, 19, 'white'], [1, 18, 'black'], [1, 17, 'white'],
  [1, 16, 'black'], [1, 15, 'white'], [1, 14, 'black'], [1, 13, 'white'],
  [1, 12, 'black'], [1, 11, 'white'], [1, 10, 'black'], [1, 9, 'white'],
  [1, 8, 'black'], [1, 7, 'white'], [1, 6, 'black'], [1, 5, 'white'],
  [1, 4, 'black'], [1, 3, 'white'], [1, 2, 'black'], [1, 1, 'white'],
  [2, 1, 'black'], [3, 1, 'white'], [4, 1, 'black'], [5, 1, 'white'],
  [6, 1, 'black'], [7, 1, 'white'], [8, 1, 'black'], [9, 1, 'white'],
  [10, 1, 'black'], [11, 1, 'white'], [12, 1, 'black'], [13, 1, 'white'],
  [14, 1, 'black'], [15, 1, 'white'], [16, 1, 'black'], [17, 1, 'white'],
  [18, 1, 'black'], [19, 1, 'white']
];
// Go Seigen vs Honinbo Shusai (1933) - First game of their historic match
const moves3: [number, number, 'black' | 'white'][] = [
  [16, 16, 'black'], [4, 4, 'white'], [4, 16, 'black'], [16, 4, 'white'],
  [10, 16, 'black'], [10, 4, 'white'], [3, 3, 'black'], [17, 3, 'white'],
  [6, 3, 'black'], [6, 17, 'white'], [14, 3, 'black'], [14, 17, 'white'],
  [17, 6, 'black'], [3, 6, 'white'], [17, 14, 'black'], [3, 14, 'white']
]

function isGameOver(moves: [number, number, 'black' | 'white'][], boardSize: number): boolean {
  return moves.length >= boardSize * boardSize || moves[moves.length - 1][2] === 'white'; // Example condition
}

export const famousGame1: Stone[][][] = moves1.reduce((acc, [x, y, color]) => {
  const lastBoard = acc[acc.length - 1]
  const newBoard = applyMove(lastBoard, x, y, color)
  return [...acc, newBoard]
}, [createEmptyBoard(19 as BoardSize)])

export const famousGame2: Stone[][][] = moves2.reduce((acc, [x, y, color]) => {
  const lastBoard = acc[acc.length - 1]
  const newBoard = applyMove(lastBoard, x, y, color)
  return [...acc, newBoard]
}, [createEmptyBoard(19 as BoardSize)])

export const famousGame3: Stone[][][] = moves3.reduce((acc, [x, y, color]) => {
  const lastBoard = acc[acc.length - 1]
  const newBoard = applyMove(lastBoard, x, y, color)
  return [...acc, newBoard]
}, [createEmptyBoard(19 as BoardSize)])

const boardSize = 19;
const isGame1Over = isGameOver(moves1, boardSize);
console.log(`The "Ear-Reddening Game" is ${isGame1Over ? 'over' : 'still ongoing'}.`);
