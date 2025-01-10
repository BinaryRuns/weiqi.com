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

// types
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
  // ----- Hooks and State -----
  const params = useParams();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Retrieve user ID from Redux store
  const userId = useSelector((state: RootState) => state.auth.userId);

  // ----- Lifecycle: on mount -----
  useEffect(() => {
    if (userId) {
      console.log("Authenticated user ID:", userId);
      // You can use userId for various purposes, like fetching user-specific data
    }
  }, [userId]);

  // ----- WebSocket Connection -----
  useEffect(() => {
    toast({
      title: "Error",
      description: "Test",
      variant: "destructive",
    });
    if (!params.gameId || !userId) return;

    console.log("Initializing WebSocket connection...");
    const sock = new SockJS(`http://localhost:8081/ws/game?userId=${userId}`);
    const client = new Client({
      webSocketFactory: () => sock,
      // debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");
        setConnected(true); // Set connected state to true
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setConnected(false); // Set connected state to false
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      if (client) {
        if (client.connected) {
          client.publish({
            destination: "/app/game.leave",
            body: JSON.stringify({ roomId: params.gameId, userId }),
          });
        }
        client.deactivate();
      }
    };
  }, [params.gameId, userId]);

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

    // Subscribe to errors
    const errorSubscription = stompClient.subscribe(
      `/user/queue/errors`,
      (message) => {
        const errorData = JSON.parse(message.body);
        console.error("WebSocket Error:", errorData);
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
    };
  }, [stompClient, connected, params.gameId, userId, toast]);

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
        <div className="bg-bigcard p-6 rounded-lg h-full">
          {/* Add game controls, chat, move history, etc. */}
        </div>
      </div>
    </div>
  );
}

// ----- Subscribe to WebSocket Errors -----
// useEffect(() => {
//   if (!stompClient) return;

//   const errorSubscription = stompClient.subscribe(
//     "/user/queue/errors",
//     (message) => {
//       const errorData = JSON.parse(message.body);
//       console.error("WebSocket Error:", errorData);

//       toast({
//         title: "Error",
//         description: errorData.errorMessage,
//         variant: "destructive",
//       });
//     }
//   );

//   return () => {
//     errorSubscription.unsubscribe();
//   };
// }, [stompClient]);

// Establish WebSocket connection when gameId and userId are available
// useEffect(() => {
//   if (!params.gameId) return;

//   console.log("Initializing WebSocket connection...");
//   console.log("Current userId:", userId);

//   // Create the SockJS + STOMP client
//   const sock = new SockJS(`http://localhost:8081/ws/game`);
//   const client = new Client({
//     webSocketFactory: () => sock,
//     debug: (str) => console.log(str),
//     onConnect: () => {
//       console.log("Connected to WebSocket");

//       // ----- Subscriptions -----
//       // 1. Main game topic (for INITIAL_STATE, UPDATE_BOARD, JOIN, LEAVE, etc.)
//       client.subscribe(`/topic/game/${params.gameId}`, (message) => {
//         const data = JSON.parse(message.body);
//         console.log("Received game message:", data);

//         if (
//           data.action === "INITIAL_STATE" ||
//           data.action === "UPDATE_BOARD"
//         ) {
//           // If the server sends a serialized stones object, transform it
//           if (data.gameRoom.stonesSerialized) {
//             data.gameRoom.stones = JSON.parse(data.gameRoom.stonesSerialized);
//           }
//           setGameState(data.gameRoom);
//           setLoading(false);
//         } else if (data.action === "JOIN") {
//           setGameState(data.gameRoom);
//           setLoading(false);
//           console.log(`${data.userId} joined the game.`);
//         } else if (data.action === "LEAVE") {
//           console.log(`${data.userId} left the game.`);
//         }
//       });

//       // 2. Timer topic (for real-time clock updates)
//       client.subscribe(`/topic/game/${params.gameId}/timer`, (message) => {
//         const timerData = JSON.parse(message.body);

//         // Update blackTime/whiteTime in our local game state
//         setGameState((prevState) => {
//           if (!prevState) return prevState;
//           return {
//             ...prevState,
//             blackTime: timerData.blackTime,
//             whiteTime: timerData.whiteTime,
//           };
//         });
//       });

//       // 2. Timeout Notiflications
//       let timeoutSubscription = client.subscribe(
//         `/topic/game/${params.gameId}/timeout`,
//         (message) => {
//           const timeoutData = JSON.parse(message.body);
//           console.log("Received timeout message:", timeoutData);

//           // Example: Display an alert or update state to show the winner
//           alert(`Game over! Winner by timeout: ${timeoutData.winner}`);

//           // Unsubscribe from further timeout notifications
//           timeoutSubscription.unsubscribe();

//           // Optionally, you could also stop listening to updates or mark the game as finished in your UI state
//           setGameState((prevState) => {
//             if (!prevState) return prevState;
//             return {
//               ...prevState,
//               // Perhaps store the winner or mark the game as ended
//             };
//           });
//         }
//       );

//       // ----- Publish Join Message -----
//       client.publish({
//         destination: "/app/game.join",
//         body: JSON.stringify({ roomId: params.gameId, userId: userId }),
//       });

//       console.log("Sent join message:", {
//         roomId: params.gameId,
//         userId: userId,
//       });
//     },

//     onDisconnect: () => {
//       console.log("Disconnected from WebSocket");
//     },
//   });

//   client.activate();
//   setStompClient(client);

//   // Cleanup: leave room and deactivate on unmount or browser tab close
//   const handleLeave = () => {
//     if (client && client.connected) {
//       client.publish({
//         destination: "/app/game.leave",
//         body: JSON.stringify({ roomId: params.gameId, userId: userId }),
//       });
//       client.deactivate();
//     }
//   };

//   window.addEventListener("beforeunload", handleLeave);

//   return () => {
//     handleLeave();
//     client.deactivate();
//     window.removeEventListener("beforeunload", handleLeave);
//   };
// }, [params.gameId, userId]);
