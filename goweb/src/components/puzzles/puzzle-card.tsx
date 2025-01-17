import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Puzzle } from "@/lib/types/puzzle";
import { PreviewBoard } from "@/components/play/board/preview-board";
import { HeartIcon } from "lucide-react";
import { Board } from "../GoBoard/Board";


interface PuzzleCardProps {
  puzzle: Puzzle;
  onClick: () => void;
}

export function PuzzleCard({ puzzle, onClick }: PuzzleCardProps) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="aspect-square relative">
      {/* TODO: Puzzle info should come with the stone previews*/}
        <Board size={puzzle.boardSize} stones={[[]]} />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2">{puzzle.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <HeartIcon className="w-4 h-4" />
            {puzzle.likes}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{puzzle.difficulty}</Badge>
          <Badge variant="outline">{puzzle.category}</Badge>
        </div>
      </div>
    </Card>
  );
}