"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard";
import { useParams } from "next/navigation";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Timer from "@/components/play/board/timer";
import { useToast } from "@/hooks/use-toast";
import ChatSection from "@/components/play/board/ChatSection";
import { ChatMessage, MessageType } from "@/types/ChatMessage";
import GoSoundEffects from "@/components/GoBoard/GoSoundEffects";
import { Button } from "@/components/ui/button";
import GameControls from "@/components/play/board/GameControls";
import GameEndModal from "@/components/play/board/GameEndModal";

// types
type BoardSize = 9 | 13 | 19;

interface GameState {
  boardSize: BoardSize;
  timeControl: string;
  stones: Array<any>;
  players: Set<Player>;
  currentPlayerColor: "black" | "white";
  currentPlayers: Array<Player>;
  maxPlayers: string;
  blackTime: number;
  whiteTime: number;
  roomId: string;
  roomName: string;
}

interface Player {
  userId: string;
  userName: string;
  color: "black" | "white";
}

export default function GamePage() {
  // ----- Hooks and State -----
  const params = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [playSound, setPlaySound] = useState<string | null>(null);
  const [resignMessage, setResignMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

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

  // ----- WebSocket Connection -----
  useEffect(() => {
    if (!params.gameId || !userId) return;

    console.log("Initializing WebSocket connection...");
    const sock = new SockJS(`http://localhost:8081/ws/game?userId=${userId}`);
    const client = new Client({
      webSocketFactory: () => sock,
      debug: () => {},
      onConnect: () => {
        console.log("Connected to WebSocket");
        setConnected(true);
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setConnected(false);
      },
    });

    client.activate();
    setStompClient(client);

    // Cleanup: Handle room leaving and deactivate the client
    const handleLeave = () => {
      if (client.connected) {
        client.publish({
          destination: "/app/game.leave",
          body: JSON.stringify({ roomId: params.gameId, userId }),
        });
        client.deactivate();
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      handleLeave();
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [params.gameId, userId, userName]);

  // ------ Subscribe to socket messages ------
  useEffect(() => {
    if (!stompClient || !connected) return;

    // Subscribe to game topic
    const gameSubscription = stompClient.subscribe(
      `/topic/game/${params.gameId}`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log("Received game message:", data);

        if (data.action === "INITIAL_STATE" || data.action === "UPDATE_BOARD") {
          // If the server sends a serialized stones object, transform it
          if (data.gameRoom.stonesSerialized) {
            data.gameRoom.stones = JSON.parse(data.gameRoom.stonesSerialized);
          }
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

    const gameTimer = stompClient.subscribe(
      `/topic/game/${params.gameId}/timer`,
      (message) => {
        const timerData = JSON.parse(message.body);

        // Update blackTime/whiteTime in our local game state
        setGameState((prevState) => {
          if (!prevState) return prevState;
          return {
            ...prevState,
            blackTime: timerData.blackTime,
            whiteTime: timerData.whiteTime,
          };
        });
      }
    );
    const soundSubscription = stompClient.subscribe(
      `/topic/game/${params.gameId}/sound`,
      (message) => {
        const data = JSON.parse(message.body);
        if (data.type === "PLAY_SOUND") {
          setPlaySound(data.color);
        }
      }
    );
    // Subscribe to errors
    const errorSubscription = stompClient.subscribe(
      `/user/queue/errors`,
      (message) => {
        const errorData = JSON.parse(message.body);
        console.error("WebSocket Error:", errorData);
      }
    );

    // Subscribe to resign message
    const resignSubscription = stompClient.subscribe(
      `/topic/game/${params.gameId}/resign`,
      (message) => {
        const data = JSON.parse(message.body);
        console.log("Resign response from server:", data);

        setResignMessage(
          `${data.resigningPlayer} resigned. ${data.winner} wins!`
        );
        setGameOver(true);
      }
    );

    // Publish join message
    stompClient.publish({
      destination: "/app/game.join",
      body: JSON.stringify({ roomId: params.gameId, userId }),
    });

    return () => {
      gameSubscription.unsubscribe();
      errorSubscription.unsubscribe();
      gameTimer.unsubscribe();
      soundSubscription.unsubscribe();
      resignSubscription.unsubscribe();
    };
  }, [stompClient, connected, params.gameId, userId, toast, userName]);

  useEffect(() => {
    if (!stompClient || !connected) return;

    const chatSubscription = stompClient.subscribe(
      `/topic/game/${params.gameId}/chat`,
      (message) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, chatMessage]);
      }
    );

    return () => {
      chatSubscription.unsubscribe();
    };
  }, [stompClient, connected, userName, userId]);

  /**
   * Handles the placement of a stone on the board
   * when clicked on the board.
   *
   * @param position
   * @returns
   */
  const handleStonePlacement = (position: { x: number; y: number }) => {
    if (!gameState || !stompClient || gameOver) return;

    const { x, y } = position;

    // subscribe to the game's topic for move updates and requests
    stompClient.publish({
      destination: "/app/game.move",
      body: JSON.stringify({
        roomId: params.gameId,
        userId: userId,
        x: x,
        y: y,
      }),
    });
  };

  const sendMessage = () => {
    if (!stompClient || !messageInput.trim()) return;

    stompClient.publish({
      destination: `/app/game.sendMessage/${params.gameId}`,
      body: JSON.stringify({
        sender: userId,
        senderUsername: userName,
        content: messageInput,
        roomId: params.gameId,
        type: MessageType.CHAT,
      }),
    });

    setMessageInput("");
  };

  const handleResign = () => {
    if (!stompClient) return;

    stompClient.publish({
      destination: "/app/game.resign",
      body: JSON.stringify({ roomId: params.gameId, userId }),
    });
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
            <GameEndModal message={resignMessage} onClose={() => {}} />
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
