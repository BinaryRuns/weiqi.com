"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import { useParams } from "next/navigation";

type BoardSize = 9 | 13 | 19;

interface GameState {
  boardSize: BoardSize;
  timeControl: string;
  stones: Array<any>; // Define proper stone type
  currentPlayer: 'black' | 'white';
  blackTime: number;
  whiteTime: number;
  // Add other game state properties
}

export default function GamePage() {
  const params = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/games/${params.gameId}`);
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        console.error('Failed to fetch game state:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameState();
  }, [params.gameId]);

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!gameState) {
    return <div>Game not found</div>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div>
          <PlayerCard 
            position="top"
            // Add player info and time remaining
          />
          <div className="flex-1 flex">
            <div className="w-full h-full max-w-[100%] max-h-[100%]">
              <Board 
                size={gameState.boardSize} 
                stones={gameState.stones}
                // Add other board props like onStonePlace
              />
            </div>
          </div>
          <div className="mt-2">
            <PlayerCard 
              position="bottom"
              // Add player info and time remaining
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[500px] h-full p-6 overflow-y-auto">
        <div className="bg-bigcard p-6 rounded-lg h-full">
          {/* Add game controls, chat, move history, etc. */}
        </div>
      </div>
    </div>
  );
}