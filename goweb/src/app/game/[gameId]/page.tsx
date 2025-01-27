"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
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

  // Retrieve user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth.userId);
  const userName = useSelector((state: RootState) => state.auth.userName);

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
        }
      }
    );

    const gameTimer = subscribe<GameTimer>(
      `/topic/game/${params.gameId}/timer`,
      (data) => {
        // Update blackTime/whiteTime in our local game state
        setGameState((prevState) => {
          if (!prevState) return prevState;
          return {
            ...prevState,
            blackTime: data.blackTime,
            whiteTime: data.whiteTime,
          };
        });
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

    // // Subscribe to errors
    // const errorSubscription = subscribe(`/user/queue/errors`, (message) => {
    //   const errorData = JSON.parse(message.body);
    //   console.error("WebSocket Error:", errorData);
    // });

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
      // errorSubscription?.unsubscribe();
      gameTimer?.unsubscribe();
      chatSubscription?.unsubscribe();
      soundSubscription?.unsubscribe();
      resignSubscription?.unsubscribe();
    };
  }, [isConnected, params.gameId, userId, toast, userName]);

  /**
   * Handles the placement of a stone on the board
   * when clicked on the board.
   *
   * @param position
   * @returns
   */
  const handleStonePlacement = (position: { x: number; y: number }) => {
    if (!gameState || gameOver || !isConnected) return;

    const { x, y } = position;

    console.log("Sending moves");

    // subscribe to the game's topic for move updates and requests
    send("/app/game.move", {
      roomId: params.gameId,
      userId: userId,
      x: x,
      y: y,
    });
  };

  const sendMessage = () => {
    if (!isConnected || !messageInput.trim()) return;

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
    if (!isConnected) return;

    send("/app/game.resign", { roomId: params.gameId, userId });
  };

  const handleDraw = () => {};

  // ----- Player Roles -----
  const currentUser = Array.from(gameState?.players || []).find(
    (player) => player.userId === userId
  );
  const opponent = Array.from(gameState?.players || []).find(
    (player) => player.userId !== userId
  );

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
        <div>
          <div className="flex flex-row justify-between">
            <PlayerCard
              position="top"
              username={opponent?.userName || "Opponent"}
              // Add player info and time remaining
            />
            <Timer
              currentTime={
                opponent?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              onTimeUp={() => alert(`${opponent?.userName}'s time is up!`)}
            />
          </div>

          <div className="flex-1 flex">
            <div className="w-full h-full max-w-[100%] max-h-[100%]">
              <Board
                size={gameState.boardSize}
                stones={gameState.stones}
                onIntersectionClick={handleStonePlacement}
                lastMove={null}
                // Add other board props like onStonePlace
              />
            </div>
          </div>
          <div className="mt-2 flex flex-row justify-between">
            <PlayerCard
              position="bottom"
              username={currentUser?.userName || "Player"}
              // Add player info and time remaining
            />
            <Timer
              currentTime={
                currentUser?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              onTimeUp={() => alert(`${currentUser?.userName}'s time is up!`)}
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
            handleRematch={() => {}}
            gameOver={gameOver}
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
