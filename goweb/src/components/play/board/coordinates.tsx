"use client";

import { BOARD_CONFIG } from '@/lib/constants/board';

interface CoordinatesProps {
  type: 'row' | 'column';
}

export function Coordinates({ type }: CoordinatesProps) {
  const { size } = BOARD_CONFIG;
  
  if (type === 'column') {
    const letters = Array.from({ length: size }, (_, i) => 
      String.fromCharCode(65 + (i >= 8 ? i + 1 : i))
    );

    return (
      <div className="flex mb-2">
        <div className="w-8" />
        {letters.map((letter) => (
          <div key={letter} className="w-8 text-center text-sm text-muted-foreground">
            {letter}
          </div>
        ))}
      </div>
    );
  }

  const numbers = Array.from({ length: size }, (_, i) => size - i);

  return (
    <div className="flex flex-col mr-2">
      {numbers.map((num) => (
        <div key={num} className="h-8 flex items-center justify-end pr-2 text-sm text-muted-foreground">
          {num}
        </div>
      ))}
    </div>
  );
}