"use client";

import { cn } from '@/lib/utils';
import { BOARD_CONFIG } from '@/lib/constants/board';

interface StoneProps {
  x: number;
  y: number;
  color: 'black' | 'white';
}

export function Stone({ color, x, y }: StoneProps) {
  const { cellSize } = BOARD_CONFIG;

  return (
    <div
      className={cn(
        "absolute w-7 h-7 rounded-full transition-transform hover:scale-105",
        "shadow-[0_2px_4px_rgba(0,0,0,0.4)]",
        color === 'black' 
          ? "bg-black/95" 
          : "bg-white border border-black/10"
      )}
      style={{
        left: `${x * cellSize}px`,
        top: `${y * cellSize}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 2
      }}
    />
  );
}