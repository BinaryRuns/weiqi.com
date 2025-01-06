"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import PlayerCard from "@/components/play/board/playercard";
import { Board } from "@/components/GoBoard/Board";

const GameRoom = () => {
  const { gameId } = useParams(); // Extract gameId from the URL
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // Establish Websocket connection
  useEffect(() => {
    if (!gameId) return;

    const sock = new SockJS(`http://localhost:8081/ws/game`);
    const client = new Client({
      webSocketFactory: () => sock,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to the game's topic
        client.subscribe(`/topic/game/${gameId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log("Received message:", data);

          if (data.action === "JOIN") {
            console.log(`${data.userId} joined the game.`);
          } else if (data.action === "LEAVE") {
            console.log(`${data.userId} left the game.`);
          } else if (data.action === "UPDATE_BOARD") {
            console.log("Updated board state:", data.boardState);
          }
        });

        // Send a "JOIN" message to the backend
        client.publish({
          destination: "/app/game.join",
          body: JSON.stringify({ roomId: gameId, userId: "test-user" }),
        });
      },

      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
      },
    });

    client.activate();
    setStompClient(client);

    return () => {
      client.publish({
        destination: "/app/game.leave",
        body: JSON.stringify({ roomId: gameId, userId: "test-user" }),
      });
      client.deactivate();
    };
  }, [gameId]);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div>
          <PlayerCard position="top" />
          <div className="flex-1 flex">
            <div className="w-full h-full max-w-[100%] max-h-[100%]">
              <Board size={19} stones={[]} />
            </div>
          </div>
          <div className="mt-2">
            <PlayerCard position="bottom" />
          </div>
        </div>

        {/* Chat Message Box */}
      </div>
    </div>
  );
};

export default GameRoom;
