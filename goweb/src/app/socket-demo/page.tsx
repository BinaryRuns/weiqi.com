"use client";

import { useState, useEffect } from "react";

export default function SocketDemo() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081/ws/game");

    ws.onopen = () => {
      console.log("WebSocket connection opened");
    };

    ws.onmessage = (event) => {
      console.log("Message received:", event.data);
      setMessages((prev) => [...prev, `Server: ${event.data}`]);
    };

    ws.onclose = (event) => {
      console.log(
        `WebSocket closed: code=${event.code}, reason=${event.reason}`
      );
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(message);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage(""); // Clear the input after sending
    } else {
      console.error("WebSocket is not open.");
    }
  };

  return (
    <div>
      <h1>Testing WebSocket</h1>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send Message</button>
      </div>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
