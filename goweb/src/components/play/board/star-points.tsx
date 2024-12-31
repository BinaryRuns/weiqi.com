"use client";

import { BOARD_CONFIG } from '@/lib/constants/board';

export function StarPoints() {
  const { cellSize } = BOARD_CONFIG;
  const starPoints = [3, 9, 15];

  return (
    <>
      {starPoints.map(x => 
        starPoints.map(y => (
          <div
            key={`star-${x}-${y}`}
            className="absolute w-2 h-2 bg-black rounded-full"
            style={{
              left: `${x * cellSize}px`,
              top: `${y * cellSize}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }}
          />
        ))
      )}
    </>
  );
}