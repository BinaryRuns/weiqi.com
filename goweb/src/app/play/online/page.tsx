"use client";

import { useState } from "react";
import { GoBoard } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import GameSetup from "@/components/play/board/gamesetup";
import { startWaiting, stopWaiting } from "@/store/waitingSlice";
import { useDispatch } from "react-redux";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { useMatchmakingNotifications } from "@/hooks/useMatchmakingNotifications";
import { fetchWithAuth } from "@/utils/api";

type BoardSize = 9 | 13 | 19;

interface GameConfig {
  size: BoardSize;
  timeControl: string;
}

export default function PlayPage() {
  useMatchmakingNotifications(); // Activate matchmaking listener

  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const userName =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

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
    if (!user) {
      console.error("No user available");
      return;
    }

    dispatch(startWaiting()); // Start waiting timer

    try {
      const response = await fetchWithAuth("/api/matchmaking/join", {
        method: "POST",
        body: JSON.stringify({
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
        <div className="flex flex-col h-full">
          <PlayerCard position="top" />
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              <GoBoard
                size={boardSize}
                initialStones={[]}
                interactive={true}
                inGame={false}
                showCoordinates={true}
              />
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
            onGameSetup={handleGameSetup}
            initialBoardSize={boardSize}
          />
        </div>
      </div>
    </div>
  );
}
