"use client";

import { useState } from "react";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import GameSetup from "@/components/play/board/gamesetup";
import { useRouter } from "next/navigation";
import { startWaiting, stopWaiting } from "@/store/waitingSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";

type BoardSize = 9 | 13 | 19;

interface GameConfig {
  size: BoardSize;
  timeControl: string;
}

export default function PlayPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Retrieve user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth.userId);
  const userName = useSelector((state: RootState) => state.auth.userName);

  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);

  const handleBoardSizeChange = (size: BoardSize) => {
    setBoardSize(size);
  };

  const handleGameSetup = (config: GameConfig) => {
    setGameConfig(config);
    joinMatchmakingQueue(config);
  };

  // Map board size to enum value
  const mapBoardSize = (size: number): string => {
    const mapping: { [key: number]: string } = {
      9: "NINE",
      13: "THIRTEEN",
      19: "NINETEEN",
    };
    return mapping[size] || "NINETEEN"; // default to "NINETEEN" if no match found
  };

  const joinMatchmakingQueue = async (config: GameConfig) => {
    dispatch(startWaiting()); // Start waiting timer

    try {
      const response = await fetch("/api/matchmaking/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          rating: 500,
          boardSize: mapBoardSize(config.size),
          timeControl: config.timeControl.toUpperCase(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to join matchmaking queue");
      }

      const data = await response.text();
      console.log("Successfully joined the queue:", data);
    } catch (error) {
      console.error("Error joining matchmaking queue:", error);
      dispatch(stopWaiting()); // Stop waiting timer on failure
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
