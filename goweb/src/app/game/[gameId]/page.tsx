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

type BoardSize = 9 | 13 | 19;

interface GameState {
  boardSize: BoardSize;
  timeControl: string;
  stones: Array<any>; // Define proper stone type
  players: Set<Player>;
  currentPlayerColor: "black" | "white";
  currentPlayers: Array<Player>;
  maxPlayers: string;
  blackTime: number;
  whiteTime: number;
  roomId: string;
  roomName: string;
  // Add other game state properties
}

interface Player {
  userId: string;
  userName: string;
  color: "black" | "white";
}

export default function GamePage() {
  const params = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Example of using userId
  useEffect(() => {
    if (userId) {
      console.log("Authenticated user ID:", userId);
      // You can use userId for various purposes, like fetching user-specific data
    }
  }, [userId]);

  // Establish Websocket connection
  useEffect(() => {
    if (!params.gameId) return;

    console.log("Initializing WebSocket connection...");
    console.log("Current userId:", userId);

    const sock = new SockJS(`http://localhost:8081/ws/game`);
    const client = new Client({
      webSocketFactory: () => sock,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to the game's topic
        client.subscribe(`/topic/game/${params.gameId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Received message:", data);

          if (
            data.action === "INITIAL_STATE" ||
            data.action === "UPDATE_BOARD"
          ) {
            // Transform backend stones to frontend format
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
        });

        // Send a "JOIN" message to the backend to join the game
        client.publish({
          destination: "/app/game.join",
          body: JSON.stringify({ roomId: params.gameId, userId: userId }),
        });

        console.log("Sent join message:", {
          roomId: params.gameId,
          userId: userId,
        });
      },

      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
      },
    });

    client.activate();
    setStompClient(client);

    // Leave room when users exits the tab
    const handleLeave = () => {
      if (client && client.connected) {
        client.publish({
          destination: "/app/game.leave",
          body: JSON.stringify({ roomId: params.gameId, userId: userId }),
        });
      }
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      handleLeave();
      client.deactivate();
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [params.gameId, userId]);

  /**
   * Handles the placement of a stone on the board
   * when clicked on the board.
   *
   * @param position
   * @returns
   */
  const handleStonePlacement = (position: { x: number; y: number }) => {
    if (!gameState || !stompClient) return;

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

  // Determine player positions
  const currentUser = Array.from(gameState?.players || []).find(
    (player) => player.userId === userId
  );
  const opponent = Array.from(gameState?.players || []).find(
    (player) => player.userId !== userId
  );

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
              initialTime={
                opponent?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              isRunning={gameState.currentPlayerColor === opponent?.color}
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
              initialTime={
                currentUser?.color === "black"
                  ? gameState.blackTime
                  : gameState.whiteTime
              }
              isRunning={gameState.currentPlayerColor === currentUser?.color}
              onTimeUp={() => alert(`${currentUser?.userName}'s time is up!`)}
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
