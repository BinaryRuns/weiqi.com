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
  return (
    <div className="flex w-full justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md">
      <Button
        onClick={handleDraw}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        Propose Draw
      </Button>
      <Button
        onClick={handleResign}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Resign
      </Button>
    </div>
  );
}
