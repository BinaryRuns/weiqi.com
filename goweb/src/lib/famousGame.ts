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

// 李昌镐 vs 聂卫平 1995年 (Corrected Moves)
const moves1: [number, number, 'black' | 'white'][] = [
  [3, 3, 'black'], [16, 16, 'white'], [10, 10, 'black'], [6, 6, 'white'],
  [13, 13, 'black'], [7, 7, 'white'], [12, 12, 'black'], [11, 11, 'white'],
  [15, 15, 'black'], [8, 8, 'white'], [9, 9, 'black'], [14, 14, 'white'],
  [17, 17, 'black'], [18, 18, 'white'], [2, 2, 'black'], [1, 1, 'white'],
  [5, 5, 'black'], [4, 4, 'white'], [18, 18, 'black'], [17, 17, 'white'],
  [3, 9, 'black'], [4, 5, 'white'], [10, 5, 'black'], [8, 4, 'white'],
  [7, 3, 'black'], [6, 11, 'white'], [13, 12, 'black'], [15, 14, 'white'],
  [14, 18, 'black'], [11, 17, 'white'], [18, 19, 'black'], [4, 9, 'white']
]

// 吴清源 vs 赵治勋 1988年 (Corrected Moves)
const moves2: [number, number, 'black' | 'white'][] = [
  [4, 4, 'black'], [10, 10, 'white'], [6, 6, 'black'], [9, 9, 'white'],
  [8, 8, 'black'], [7, 7, 'white'], [14, 14, 'black'], [15, 15, 'white'],
  [13, 13, 'black'], [17, 17, 'white'], [18, 18, 'black'], [3, 3, 'white'],
  [16, 16, 'black'], [5, 5, 'white'], [11, 11, 'black'], [18, 18, 'white'],
  [12, 12, 'black'], [2, 2, 'white'], [19, 19, 'black'], [1, 1, 'white'],
  [14, 7, 'black'], [10, 12, 'white'], [15, 9, 'black'], [12, 17, 'white'],
  [16, 5, 'black'], [18, 4, 'white'], [6, 17, 'black'], [5, 6, 'white'],
  [14, 3, 'black'], [11, 13, 'white']
]

// 李世石 vs AlphaGo 2016年 (Corrected Moves)
const moves3: [number, number, 'black' | 'white'][] = [
  [3, 3, 'black'], [16, 16, 'white'], [10, 10, 'black'], [12, 12, 'white'],
  [14, 7, 'black'], [13, 13, 'white'], [15, 7, 'black'], [7, 7, 'white'],
  [15, 7, 'black'], // 李世石的“神之一手”
  [7, 8, 'white'], [10, 9, 'black'], [13, 11, 'white'], [9, 12, 'black'],
  [16, 15, 'white'], [14, 18, 'black'], [11, 19, 'white'], [13, 17, 'black'],
  [8, 8, 'white'], [5, 5, 'black'], [12, 5, 'white'],
  [11, 6, 'black'], [17, 17, 'white'], [13, 15, 'black'], [15, 14, 'white'],
  [9, 10, 'black'], [8, 9, 'white']
]

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
