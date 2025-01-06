"use client";

import { useState } from "react";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import GameSetup from "@/components/play/board/gamesetup";
import { useRouter } from "next/navigation";

type BoardSize = 9 | 13 | 19;

interface GameConfig {
  size: BoardSize;
  timeControl: string;
}

export default function PlayPage() {
  const router = useRouter();

  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleBoardSizeChange = (size: BoardSize) => {
    setBoardSize(size);
  };

  const handleGameSetup = (config: GameConfig) => {
    setGameConfig(config);
    createGame(config);
  };

  const createGame = async (config: GameConfig) => {
    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: `Game ${config.size}x${config.size}`,
          maxPlayers: 2,
          boardSize: config.size,
          timeControl: config.timeControl.toUpperCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Game created successfully:", data);
        // Redirect to the game page with the created game room ID
        router.push(`/game/${data.roomId}`);
      } else {
        console.error("Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
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
            onGameSetup={handleGameSetup} // Pass handler to GameSetup
            initialBoardSize={boardSize}
          />
        </div>
      </div>
    </div>
  );
}
