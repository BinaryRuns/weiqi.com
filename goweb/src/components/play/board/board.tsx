"use client";

import React from 'react';
import { BoardGrid } from './board-grid';
import { Coordinates } from './coordinates';
import { StarPoints } from './star-points';
import { Stone } from './stone';
import { BOARD_CONFIG } from '@/lib/constants/board';

interface BoardProps {
  onIntersectionClick: (x: number, y: number) => void;
  stones: Array<{ x: number; y: number; color: 'black' | 'white' }>;
}

export function Board({ onIntersectionClick, stones }: BoardProps) {
  const { size, cellSize, boardSize } = BOARD_CONFIG;
  
  return (
    <div className="flex flex-col items-center">
      {/* Column coordinates (A-T, excluding I) */}
      <Coordinates type="column" />

      <div className="flex">
        {/* Row coordinates (1-19) */}
        <Coordinates type="row" />
        
        {/* Main board */}
        <div 
          className="relative bg-[#E6BA7A] p-4 rounded-sm shadow-lg"
          style={{
            width: `${boardSize + 32}px`,
            height: `${boardSize + 32}px`,
            backgroundImage: "url('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800')",
            backgroundSize: 'cover',
            backgroundBlend: 'overlay'
          }}
        >
          <div 
            className="relative" 
            style={{
              width: `${boardSize}px`,
              height: `${boardSize}px`
            }}
          >
            {/* Grid lines */}
            <BoardGrid />

            {/* Star points */}
            <StarPoints />

            {/* Intersection click areas */}
            {Array.from({ length: size }).map((_, y) => 
              Array.from({ length: size }).map((_, x) => (
                <div
                  key={`intersection-${x}-${y}`}
                  className="absolute cursor-pointer hover:bg-black/10 rounded-full transition-colors"
                  style={{
                    left: `${x * cellSize}px`,
                    top: `${y * cellSize}px`,
                    width: '24px',
                    height: '24px',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}
                  onClick={() => onIntersectionClick(x, y)}
                />
              ))
            )}

            {/* Stones */}
            {stones.map((stone, index) => (
              <Stone
                key={`stone-${index}`}
                {...stone}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}