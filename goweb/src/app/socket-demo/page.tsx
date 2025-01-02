"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { Client, Frame, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useRouter } from "next/navigation";
import { GameRoom } from "@/types/GameRoom";
import { ChatMessage, MessageType } from "@/types/ChatMessage";
import { fetchWithAuth } from "@/utils/api";
import withAuth from "@/auth/WithAuth";

const HomePage: React.FC = () => {
  const router = useRouter();

  // State variables for creating a room
  const [roomName, setRoomName] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<string>("2");
  const [createError, setCreateError] = useState<string>("");
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);

  // State variables for listing and joining rooms
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);
  const [listError, setListError] = useState<string>("");
  const [joiningRoom, setJoiningRoom] = useState<boolean>(false);

  // State for chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [chatError, setChatError] = useState<string>("");

  // WebSocket client
  const [stompClient, setStompClient] = useState<Client | null>(null);

  // User ID (demo usage)
  const [userId] = useState<string>(`User-${Math.floor(Math.random() * 1000)}`);

  // Room ID the user has joined
  const [joinedRoomId, setJoinedRoomId] = useState<string>("");

  // Fetch available rooms on mount
  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetchWithAuth("/api/game/rooms", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Error fetching rooms: ${response.statusText}`);
      }

      const data: GameRoom[] = await response.json();
      setAvailableRooms(data);
      setListError("");
    } catch (error) {
      console.error(error);
      setListError("Failed to fetch available rooms.");
    }
  };

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      const parsedMaxPlayers = parseInt(maxPlayers, 10);
      if (
        isNaN(parsedMaxPlayers) ||
        parsedMaxPlayers < 2 ||
        parsedMaxPlayers > 10
      ) {
        throw new Error("Max Players must be between 2 and 10.");
      }

      const response = await fetchWithAuth("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          maxPlayers: parsedMaxPlayers,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating room: ${response.statusText}`);
      }

      const data: GameRoom = await response.json();
      setCreatedRoom(data);
      alert(`Room created with ID: ${data.roomId}`);
      fetchAvailableRooms(); // Refresh rooms
    } catch (error) {
      console.error(error);
      setCreateError("Failed to create room.");
    }
  };

  const handleJoinRoom = (roomId: string) => {
    setJoiningRoom(true);
    setJoinedRoomId(roomId);
    connectWebSocket(roomId);
  };

  const connectWebSocket = (roomId: string) => {
    const socket = new SockJS("http://localhost:8081/ws/game");
    const client = new Client({
      webSocketFactory: () => socket as unknown as WebSocket,
      reconnectDelay: 5000,
      debug: () => {}, // Disable debug logs

      onConnect: () => {
        console.log("Connected to WebSocket");

        // Subscribe to updated GameRoom info
        client.subscribe(`/topic/game/${roomId}`, (message: IMessage) => {
          const updatedRoom: GameRoom = JSON.parse(message.body);
          console.log("Updated GameRoom received:", updatedRoom);

          // Update the available rooms list
          setAvailableRooms((prevRooms) =>
            prevRooms.map((room) =>
              room.roomId === updatedRoom.roomId ? updatedRoom : room
            )
          );

          // If the message is also a ChatMessage,
          // we can optionally parse it for chat content
          try {
            const receivedMessage: ChatMessage = JSON.parse(message.body);
            // Add chat message to local state
            setMessages((prev) => [...prev, receivedMessage]);
          } catch (e) {
            // Not a ChatMessage, ignoring
          }
        });

        // Send JOIN message
        const joinMessage: ChatMessage = {
          sender: "System",
          content: `${userId} has joined the room.`,
          roomId,
          type: MessageType.JOIN,
        };
        client.publish({
          destination: "/app/game.join",
          body: JSON.stringify(joinMessage),
        });
      },

      onStompError: (frame: Frame) => {
        console.error("Broker reported error:", frame.headers["message"]);
        console.error("Additional details:", frame.body);
        setChatError("WebSocket connection error.");
      },
    });

    client.activate();
    setStompClient(client);
  };

  const disconnectWebSocket = () => {
    if (stompClient) {
      // Notify others that we are leaving
      const leaveMessage: ChatMessage = {
        sender: "System",
        content: `${userId} has left the room.`,
        roomId: joinedRoomId,
        type: MessageType.LEAVE,
      };
      stompClient.publish({
        destination: "/app/game.sendMessage",
        body: JSON.stringify(leaveMessage),
      });

      stompClient.deactivate();
    }
    setStompClient(null);
    setJoinedRoomId("");
    setMessages([]);
  };

  const sendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!stompClient || !stompClient.connected) {
      alert("WebSocket is not connected.");
      return;
    }
    if (input.trim() === "") return;

    const chatMessage: ChatMessage = {
      sender: userId,
      content: input,
      roomId: joinedRoomId,
      type: MessageType.CHAT,
    };

    stompClient.publish({
      destination: `/app/game.sendMessage/${joinedRoomId}`,
      body: JSON.stringify(chatMessage),
    });
    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8">
        Multiplayer Game Room
      </h1>

      {!joinedRoomId ? (
        <>
          {/* Create Room Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">
              Create a New Game Room
            </h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="roomName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Room Name (Optional)
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="maxPlayers"
                  className="block text-sm font-medium text-gray-700"
                >
                  Max Players
                </label>
                <input
                  id="maxPlayers"
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  min={2}
                  max={10}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Room
              </button>
            </form>
            {createError && <p className="text-red-500 mt-2">{createError}</p>}
            {createdRoom && (
              <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-md">
                <p>
                  Room <strong>ID:</strong> {createdRoom.roomId}
                </p>
              </div>
            )}
          </section>

          {/* Available Rooms Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Available Game Rooms
            </h2>
            {listError && <p className="text-red-500 mb-4">{listError}</p>}
            {availableRooms.length === 0 ? (
              <p className="text-gray-600">No available rooms. Create one!</p>
            ) : (
              <ul className="space-y-4">
                {availableRooms.map((room) => (
                  <li
                    key={room.roomId}
                    className="flex justify-between items-center p-4 bg-white shadow rounded-md"
                  >
                    <div>
                      <p className="text-lg font-medium">
                        {room.roomName || "Unnamed Room"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Players: {room.currentPlayers}/{room.maxPlayers}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room.roomId)}
                      disabled={room.currentPlayers >= room.maxPlayers}
                      className={`px-4 py-2 rounded-md text-white ${
                        room.currentPlayers >= room.maxPlayers
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      } transition-colors`}
                    >
                      {room.currentPlayers >= room.maxPlayers ? "Full" : "Join"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : (
        <>
          {/* Chat Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                Room ID: {joinedRoomId}
              </h2>
              <button
                onClick={disconnectWebSocket}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Leave Room
              </button>
            </div>
            {chatError && <p className="text-red-500 mb-4">{chatError}</p>}
            <div className="h-80 overflow-y-scroll p-4 bg-gray-50 border border-gray-200 rounded-md mb-4">
              {messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  {msg.type === MessageType.JOIN && (
                    <p className="text-sm text-gray-500 italic">
                      {msg.content}
                    </p>
                  )}
                  {msg.type === MessageType.LEAVE && (
                    <p className="text-sm text-gray-500 italic">
                      {msg.content}
                    </p>
                  )}
                  {msg.type === MessageType.CHAT && (
                    <div>
                      <span className="font-semibold">{msg.sender}:</span>{" "}
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
};

export default withAuth(HomePage);
