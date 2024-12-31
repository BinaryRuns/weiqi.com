"use client";

import { BoardSize } from '@/lib/types/go';
import { cn } from '@/lib/utils';

interface PreviewBoardProps {
  size: BoardSize;
  className?: string;
}

export function PreviewBoard({ size, className }: PreviewBoardProps) {
  return (
    <div className={cn("aspect-square w-full relative", className)}>
      <div 
        className="absolute inset-0 bg-cover rounded-lg shadow-lg"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=800')" }}
      />
      
      <div className="relative grid h-full w-full p-[5%]">
        {Array(size).fill(null).map((_, row) => (
          Array(size).fill(null).map((_, col) => (
            <div
              key={`${row}-${col}`}
              className={cn(
                "relative",
                "before:absolute before:content-[''] before:w-full before:h-[1px] before:bg-black/70 before:top-1/2 before:-translate-y-1/2",
                "after:absolute after:content-[''] after:h-full after:w-[1px] after:bg-black/70 after:left-1/2 after:-translate-x-1/2",
              )}
              style={{
                gridRow: row + 1,
                gridColumn: col + 1,
              }}
            />
          ))
        ))}
      </div>
    </div>
  );
}