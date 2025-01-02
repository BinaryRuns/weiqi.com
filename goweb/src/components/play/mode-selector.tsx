"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BoardSize } from "@/lib/types/go";
import { PreviewBoard } from "./board/preview-board";

const boardSizes = [
  { size: 9, label: "9×9", description: "Quick games, perfect for beginners" },
  { size: 13, label: "13×13", description: "Medium-sized games, good for practice" },
  { size: 19, label: "19×19", description: "Traditional size, full strategic depth" },
] as const;

interface BoardSelectorProps {
  selectedSize: BoardSize;
  onSelectSize: (size: BoardSize) => void;
  onStartGame: () => void;
}

export function BoardSelector({ selectedSize, onSelectSize, onStartGame }: BoardSelectorProps) {
  return (
    <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
      {/* Board Preview */}
      <div className="aspect-square mx-auto">
        <PreviewBoard size={selectedSize} className="w-[400px]" />
      </div>

      {/* Game Options */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Choose Board Size</h1>
          <p className="text-muted-foreground">Select the board size for your game</p>
        </div>

        <div className="grid gap-4">
          {boardSizes.map(({ size, label, description }) => (
            <Card
              key={size}
              className={cn(
                "p-4 cursor-pointer transition-colors",
                selectedSize === size && "border-primary"
              )}
              onClick={() => onSelectSize(size)}
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-2xl font-bold">
                  {label}
                </div>
                <div>
                  <h3 className="font-semibold">{label} Board</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={onStartGame} className="w-full">
          Start Game
        </Button>
      </div>
    </div>
  );
}
