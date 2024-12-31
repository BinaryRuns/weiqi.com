"use client";

import { useCallback } from 'react';
import { BoardSize, GameState } from '@/lib/types/go';
import { isValidMove } from '@/lib/game/board-utils';
import { Intersection } from './board/intersection';

interface GoBoardProps {
  size: BoardSize;
  gameState: GameState;
  onMove: (row: number, col: number) => void;
}

export function GoBoard({ size, gameState, onMove }: GoBoardProps) {
  const handleIntersectionClick = useCallback((row: number, col: number) => {
    if (isValidMove(gameState.board, { row, col }, gameState.currentPlayer)) {
      onMove(row, col);
    }
  }, [gameState, onMove]);

  return (
    <div className="aspect-square w-full max-w-[800px] mx-auto relative">
      <div 
        className="absolute inset-0 bg-cover rounded-lg shadow-lg"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800')" }}
      />
      
      <div className="relative grid h-full w-full p-[5%]">
        {Array(size).fill(null).map((_, row) => (
          Array(size).fill(null).map((_, col) => (
            <Intersection
              key={`${row}-${col}`}
              row={row}
              col={col}
              stone={gameState.board[row][col]}
              onClick={() => handleIntersectionClick(row, col)}
            />
          ))
        ))}
      </div>
    </div>
  );
}