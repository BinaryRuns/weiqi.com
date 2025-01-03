"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import GameSetup from "@/components/play/board/gamesetup";

type BoardSize = 9 | 13 | 19;

interface GameConfig {
  size: BoardSize;
  timeControl: string;
}

export default function PlayPage() {
  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleBoardSizeChange = (size: BoardSize) => {
    setBoardSize(size);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div>
          <PlayerCard position="top" />
          <div className="flex-1 flex">
            <div className="w-full h-full max-w-[100%] max-h-[100%]">
              <Board size={boardSize} stones={[]} />
            </div>
          </div>
          <div className="mt-2">
            <PlayerCard position="bottom" />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[500px] h-full p-6 overflow-y-auto">
        <div className="bg-bigcard p-6 rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center mb-10">New Game</h1>
          <GameSetup 
            onBoardSizeChange={handleBoardSizeChange} 
            initialBoardSize={boardSize}
          />
        </div>
      </div>
    </div>
  );
}