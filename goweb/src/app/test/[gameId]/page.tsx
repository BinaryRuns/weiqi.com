"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import Timer from "@/components/play/board/timer";
import ChatSection from "@/components/play/board/ChatSection";
import GoSoundEffects from "@/components/GoBoard/GoSoundEffects";
import GameControls from "@/components/play/board/GameControls";
import GameEndModal from "@/components/play/board/GameEndModal";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { gameActions } from "@/store/gameSlice";
import {
  selectCurrentGame,
  selectPlayers,
  selectChatMessages,
  selectGameStatus,
  selectGameError,
} from "@/store/selectors";
import type { RootState } from "@/store/store";
import { StoneColor } from "@/components/GoBoard/types";

export default function GamePage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { connect } = useWebSocket();
  const { sendMove, sendChat, sendResign } = useGameWebSocket(
    params.gameId as string
  );

  const [messageInput, setMessageInput] = useState("");
  const [playSound, setPlaySound] = useState<string | null>(null);

  // Redux state selectors
  const gameState = useAppSelector(selectCurrentGame);
  const messages = useAppSelector(selectChatMessages);
  const players = useAppSelector(selectPlayers);
  const gameStatus = useAppSelector(selectGameStatus);
  const error = useAppSelector(selectGameError);
  const userId = useAppSelector((state: RootState) => state.auth.userId);
  const userName = useAppSelector((state: RootState) => state.auth.userName);

  // Game state derived values
  const gameOver = gameStatus === "finished";
  const currentPlayer = players.find((player) => player.userId === userId);
  const opponent = players.find((player) => player.userId !== userId);

  // Initialize WebSocket connection
  useEffect(() => {
    if (params.gameId && userId) {
      connect(params.gameId as string, userId);
    }
  }, [params.gameId, userId, connect]);

  // Handle game state changes
  useEffect(() => {
    if (gameStatus === "finished") {
      setPlaySound("game-end");
    }
  }, [gameStatus]);

  const handleStonePlacement = (position: { x: number; y: number }) => {
    if (!gameOver && currentPlayer) {
      sendMove(position.x, position.y);
      setPlaySound("stone-place");
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendChat(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleResign = () => {
    sendResign();
    dispatch(gameActions.setGameStatus("finished"));
  };

  if (!gameState) {
    return <div className="p-4 text-center">Loading game session...</div>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Game Board Section */}
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div className="space-y-4">
          {/* Opponent Section */}
          <div className="flex flex-row justify-between items-center">
            <PlayerCard
              position="top"
              username={opponent?.userName || "Waiting for opponent..."}
            />
            <Timer
              currentTime={gameState.blackTime}
              onTimeUp={() => alert("time is up")}
            />
          </div>

          {/* Game Board */}
          <div className="flex-1 flex justify-center items-center">
            <Board
              size={gameState.boardSize}
              stones={gameState.stones as unknown as StoneColor[][]}
              onIntersectionClick={handleStonePlacement}
              disabled={gameOver || !currentPlayer}
            />
          </div>

          {/* Current Player Section */}
          <div className="mt-2 flex flex-row justify-between items-center">
            <PlayerCard
              position="bottom"
              username={currentPlayer?.userName || "Player"}
            />
            <Timer
              currentTime={gameState.whiteTime}
              onTimeUp={() => alert("time is up")}
            />
          </div>
        </div>
      </div>

      {/* Game Controls & Chat Section */}
      <div className="w-full md:w-[500px] h-full p-6 overflow-y-auto">
        <div className="bg-bigcard p-6 rounded-lg h-full flex flex-col gap-4">
          <GameControls
            handleResign={handleResign}
            handleDraw={() => alert("Draw request sent")}
            gameOver={gameOver}
            handleRematch={() => window.location.reload()}
          />

          {error && (
            <div className="mt-4 p-2 text-red-500 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {gameOver && (
            <GameEndModal
              message={"Game completed"}
              onClose={() => dispatch(gameActions.resetGame())}
            />
          )}

          <ChatSection
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            sendMessage={handleSendMessage}
          />
        </div>
      </div>

      <GoSoundEffects playSound={playSound} />
    </div>
  );
}
