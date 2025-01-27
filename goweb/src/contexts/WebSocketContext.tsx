"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback,
} from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription, IFrame } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

// Define the shape of your WebSocket context
type WebSocketContextType = {
  isConnected: boolean;
  subscribe: <T>(
    destination: string,
    callback: (data: T) => void
  ) => StompSubscription | null;
  send: (destination: string, body: any) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// WebSocketProvider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const userId = useSelector((state: RootState) => state.auth.userId);

  // Initialize and configure the STOMP client
  const connect = useCallback(() => {
    if (!userId) {
      console.warn("No access token - skipping WebSocket connection");
      return;
    }

    if (clientRef.current && clientRef.current.active) {
      console.warn("WebSocket is already connected.");
      return;
    }

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`http://localhost:8081/ws?userId=${userId}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        console.log("[WebSocket Debug]", msg);
      },
      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
      },
      onStompError: (frame: IFrame) => {
        console.error("WebSocket encountered an error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [userId]); // Recreate when accessToken changes

  // Disconnect the STOMP client
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      console.log("WebSocket connection closed.");
    }
  }, []); // Empty dependency array - never changes

  // Subscribe to a destination
  const subscribe = <T,>(
    destination: string,
    callback: (data: T) => void
  ): StompSubscription | null => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn("WebSocket is not connected. Unable to subscribe.");
      return null;
    }

    return clientRef.current.subscribe(destination, (message: IMessage) => {
      console.log("Received message:", JSON.parse(message.body));

      if (message.body) {
        try {
          const data: T = JSON.parse(message.body);

          console.log(data);
          callback(data);
        } catch (error) {
          console.error("Failed to parse message body:", error);
        }
      }
    });
  };

  // Send a message to a destination
  const send = (destination: string, body: any) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn("WebSocket is not connected. Unable to send message.");
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  };

  // 2. Add cleanup to useEffect
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]); // Now stable with memoized disconnect

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use the WebSocket context
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
