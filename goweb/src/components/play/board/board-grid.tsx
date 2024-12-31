"use client";

import { BOARD_CONFIG } from '@/lib/constants/board';

export function BoardGrid() {
  const { size, cellSize } = BOARD_CONFIG;

  return (
    <>
      {Array.from({ length: size }).map((_, i) => (
        <div key={`grid-${i}`}>
          {/* Horizontal lines */}
          <div 
            className="absolute border-t border-black/70" 
            style={{
              top: `${i * cellSize}px`,
              left: 0,
              right: 0
            }}
          />
          {/* Vertical lines */}
          <div 
            className="absolute border-l border-black/70" 
            style={{
              left: `${i * cellSize}px`,
              top: 0,
              bottom: 0
            }}
          />
        </div>
      ))}
    </>
  );
}