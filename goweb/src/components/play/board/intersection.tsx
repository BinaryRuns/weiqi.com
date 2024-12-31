import { cn } from '@/lib/utils';
import { StoneColor } from '@/lib/types/go';

interface IntersectionProps {
  row: number;
  col: number;
  stone: StoneColor;
  onClick: () => void;
}

export function Intersection({ row, col, stone, onClick }: IntersectionProps) {
  return (
    <div
      className={cn(
        "relative",
        "before:absolute before:content-[''] before:w-full before:h-[1px] before:bg-black/70 before:top-1/2 before:-translate-y-1/2",
        "after:absolute after:content-[''] after:h-full after:w-[1px] after:bg-black/70 after:left-1/2 after:-translate-x-1/2",
      )}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
      }}
      onClick={onClick}
    >
      {stone && (
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-[90%] h-[90%]",
            "shadow-md transition-transform hover:scale-105",
            stone === 'black' ? "bg-black" : "bg-white border border-black/10"
          )}
        />
      )}
    </div>
  );
}