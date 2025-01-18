"use client";

import { Button } from "@/components/ui/button";

interface GameControlsProps {
  handleDraw: () => void;
  handleResign: () => void;
}

export default function GameControls({
  handleDraw,
  handleResign,
}: GameControlsProps) {
  // TODO: Fix coloring of buttons
  return (
    
    <div className="flex w-full justify-between items-center p-4 bg-bigcard rounded-lg shadow-md">
      <Button
        onClick={handleDraw}
        variant="default"
      >
        Propose Draw
      </Button>
      <Button
        onClick={handleResign}
        variant="destructive"
      >
        Resign
      </Button>
    </div>
  );
}
