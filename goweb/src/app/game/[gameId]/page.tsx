"use client";

import { useEffect, useState } from "react";
import { GoBoard } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import { useParams } from "next/navigation";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import Timer from "@/components/play/board/timer";
import { useToast } from "@/hooks/use-toast";
import ChatSection from "@/components/play/board/ChatSection";
import { ChatMessage, MessageType } from "@/types/ChatMessage";
import GoSoundEffects from "@/components/GoBoard/GoSoundEffects";
import GameControls from "@/components/play/board/GameControls";
import GameEndModal from "@/components/play/board/GameEndModal";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  GameSound,
  GameState,
  RoomEvent,
  GameTimer,
  GameResign,
} from "@/types/game-types";

export default function GamePage() {
  // ----- Hooks and State -----
  const params = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [playSound, setPlaySound] = useState<string | null>(null);
  const [resignMessage, setResignMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const { subscribe, isConnected, send } = useWebSocket();

  // Get user data from Supabase
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const userName =
    user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  // ----- Testing -----
  useEffect(() => {
    if (userId) {
      console.log("Authenticated user ID:", userId);
      console.log("Username: " + userName);
    }
  }, [userId, userName]);

  // ------ Subscribe to socket messages ------
  useEffect(() => {
    if (!userId || !isConnected) return;

    // Subscribe to game topic
    const gameSubscription = subscribe<RoomEvent>(
      `/topic/game/${params.gameId}`,
      (data) => {
        console.log("This is what i recieved: ", data.gameRoom.stones);

        if (data.action === "INITIAL_STATE" || data.action === "UPDATE_BOARD") {
          setGameState(data.gameRoom);
          setLoading(false);
        } else if (data.action === "JOIN") {
          setGameState(data.gameRoom);
          setLoading(false);
          console.log(`${data.userId} joined the game.`);
        } else if (data.action === "LEAVE") {
          console.log(`${data.userId} left the game.`);
        } else if (data.action === "GAME_OVER") {
          setGameState(data.gameRoom);
          setGameOver(true);
        }
      }
    );

    const soundSubscription = subscribe<GameSound>(
      `/topic/game/${params.gameId}/sound`,
      (data) => {
        if (data.type === "PLAY_SOUND") {
          setPlaySound(data.color);
        }
      }
    );

    // Subscribe to timeout notifications
    const timeoutSubscription = subscribe<{ winner: string }>(
      `/topic/game/${params.gameId}/timeout`,
      (data) => {
        console.log("Timeout: ", data);
        setResignMessage(`Time's up! ${data.winner} wins!`);
        setGameOver(true);
      }
    );

    // Subscribe to errors
    const errorSubscription = subscribe<{errorCode: string, errorMessage: string}>(`/user/queue/errors`, (msg) => {
      console.log("Error: ", msg);
      toast({
        title: "Error",
        description: msg.errorMessage,
        variant: "destructive",
        duration: 1000,
      });
    });

    // Subscribe to resign message
    const resignSubscription = subscribe<GameResign>(
      `/topic/game/${params.gameId}/resign`,
      (data) => {
        setResignMessage(
          `${data.resigningPlayer} resigned. ${data.winner} wins!`
        );
        setGameOver(true);
      }
    );

    // Subscribe to pass notifications
    const passSubscription = subscribe<{ player: string, color: string, result?: string }>(
      `/topic/game/${params.gameId}/pass`,
      (data) => {
        if (data.result === "two_passes") {
          setResignMessage(`Game ended by agreement after two consecutive passes.`);
          setGameOver(true);
        } else {
          toast({
            title: "Pass",
            description: `${data.player} (${data.color}) passed their turn.`,
            duration: 3000,
          });
        }
      }
    );

    // Subscribe to draw notifications
    const drawSubscription = subscribe<{ player: string, result: string }>(
      `/topic/game/${params.gameId}/draw`,
      (data) => {
        setResignMessage(`Game ended in a draw by agreement.`);
        setGameOver(true);
      }
    );

    const chatSubscription = subscribe<ChatMessage>(
      `/topic/game/${params.gameId}/chat`,
      (message) => {
        setMessages((prev) => [...prev, message]);
      }
    );

    // Send a ready message to the server
    send(`/app/game.ready`, { roomId: params.gameId, userId });

    return () => {
      gameSubscription?.unsubscribe();
      chatSubscription?.unsubscribe();
      soundSubscription?.unsubscribe();
      timeoutSubscription?.unsubscribe();
      resignSubscription?.unsubscribe();
      passSubscription?.unsubscribe();
      drawSubscription?.unsubscribe();
      errorSubscription?.unsubscribe();
    };
  }, [isConnected, params.gameId, userId, toast, userName, subscribe, send]);

  /**
   * Handles the placement of a stone on the board
   * when clicked on the board.
   *
   * @param x
   * @param y
   * @param color
   * @returns
   */
  const handleStonePlacement = (x: number, y: number) => {
    if (!gameState || gameOver || !isConnected || !userId) return;

    send("/app/game.move", {
      roomId: params.gameId,
      userId,
      x,
      y,
    });
  };

  const sendMessage = () => {
    if (!isConnected || !messageInput.trim() || !userId || !userName) return;

    send(`/app/game.sendMessage/${params.gameId}`, {
      sender: userId,
      senderUsername: userName,
      content: messageInput,
      roomId: params.gameId,
      type: MessageType.CHAT,
    });

    setMessageInput("");
  };

  const handleResign = () => {
    if (!isConnected || !userId) return;

    send("/app/game.resign", { roomId: params.gameId, userId });
  };

  const handlePass = () => {
    if (!isConnected || !userId || gameOver) return;
    
    send("/app/game.pass", { roomId: params.gameId, userId });
  };

  const handleDraw = () => {
    if (!isConnected || !userId || gameOver) return;
    
    send("/app/game.draw", { roomId: params.gameId, userId });
  };

  // ----- Player Roles -----
  const currentUser = Array.from(gameState?.players || []).find(
    (player) => player.userId === userId
  );
  
  // Check if the current user is a player or spectator
  const isSpectator = currentUser === undefined;
  
  // For spectators, we want to show black at top, white at bottom
  // For players, we want to show opponent at top, current player at bottom
  const blackPlayer = Array.from(gameState?.players || []).find(
    (player) => player.color === "black"
  );
  
  const whitePlayer = Array.from(gameState?.players || []).find(
    (player) => player.color === "white"
  );
  
  // Determine which players to show at top and bottom
  const topPlayer = isSpectator ? blackPlayer : 
    Array.from(gameState?.players || []).find((player) => player.userId !== userId);
    
  const bottomPlayer = isSpectator ? whitePlayer : currentUser;

  // ----- Rendering -----
  if (loading) {
    return <div>Loading game...</div>;
  }

  if (!gameState) {
    console.log(gameState);

    return <div>Game not found</div>;
  }

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div className="flex flex-col h-full">
          <div className="flex flex-row justify-between">
            <PlayerCard
              position="top"
              username={topPlayer?.userName || "Opponent"}
            />
            <Timer
              currentTime={
                topPlayer?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              isActive={gameState.currentPlayerColor === topPlayer?.color}
              gameStatus={gameState.status}
              increment={gameState.timeControl.increment}
            />
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0">
              <GoBoard
                size={gameState?.boardSize || 19}
                initialStones={
                  gameState?.stones
                    ?.map((row, y) =>
                      row.map((color, x) => (color ? { x, y, color } : null))
                    )
                    .flat()
                    .filter(
                      (
                        stone
                      ): stone is {
                        x: number;
                        y: number;
                        color: "black" | "white";
                      } => stone !== null
                    ) || []
                }
                interactive={!isSpectator}
                onPlaceStone={(x, y) => handleStonePlacement(x, y)}
                inGame={true}
                showCoordinates={true}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-row justify-between">
            <PlayerCard
              position="bottom"
              username={bottomPlayer?.userName || "Player"}
            />
            <Timer
              currentTime={
                bottomPlayer?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              isActive={gameState.currentPlayerColor === bottomPlayer?.color}
              gameStatus={gameState.status}
              increment={gameState.timeControl.increment}
            />
          </div>
        </div>
      </div>

      <div className="w-full md:w-[500px] h-full p-6 overflow-y-auto">
        <div className="bg-bigcard p-6 rounded-lg h-full flex flex-col">
          {/* Resign Button */}

          <GameControls
            handleDraw={handleDraw}
            handleResign={handleResign}
            handlePass={handlePass}
            handleRematch={() => {}}
            gameOver={gameOver}
            isSpectator={isSpectator}
          />

          {resignMessage && (
            <div className="mt-4 text-red-500">{resignMessage}</div>
          )}

          {gameOver && resignMessage && (
            <GameEndModal
              message={resignMessage}
              onClose={() => {
                setGameOver(false);
              }}
            />
          )}

          {/* Add game controls, chat, move history, etc. */}
          <ChatSection
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            sendMessage={sendMessage}
          />
        </div>
      </div>
      <GoSoundEffects playSound={playSound} />
    </div>
  );
}
