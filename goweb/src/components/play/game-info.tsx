import { Card } from "@/components/ui/card";
import { StoneColor } from "@/lib/types/go";

interface GameInfoProps {
  currentPlayer: StoneColor;
  captures: {
    black: number;
    white: number;
  };
  moveCount: number;
}

export function GameInfo({ currentPlayer, captures, moveCount }: GameInfoProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Game Info</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-black" />
            <span className={currentPlayer === 'black' ? "font-medium" : ""}>Black</span>
          </div>
          <span className="text-sm text-muted-foreground">Captures: {captures.black}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white border" />
            <span className={currentPlayer === 'white' ? "font-medium" : ""}>White</span>
          </div>
          <span className="text-sm text-muted-foreground">Captures: {captures.white}</span>
        </div>

        <div className="text-sm text-muted-foreground pt-2 border-t">
          <p>Move: {moveCount}</p>
          <p>Time: 00:00</p>
        </div>
      </div>
    </Card>
  );
}