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
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { WS_URL } from "@/config/api";

/**
 * Defines the shape of the WebSocket context
 */
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

/**
 * WebSocketProvider component that manages the WebSocket connection and context
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, session } = useSupabaseAuth();
  const userId = user?.id;
  const accessToken = session?.access_token;

  // Initialize and configure the STOMP client
  const connect = useCallback(() => {
    if (!userId || !accessToken) {
      return;
    }

    if (clientRef.current && clientRef.current.active) {
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}?token=${accessToken}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg: string) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[WS]", msg);
        }
      },
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame: IFrame) => {
        console.error("WebSocket error:", frame);
      },
    });

    client.activate();
    clientRef.current = client;
  }, [userId, accessToken]);

  // Disconnect the STOMP client
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Subscribe to a destination
  const subscribe = <T,>(
    destination: string,
    callback: (data: T) => void
  ): StompSubscription | null => {
    if (!clientRef.current || !clientRef.current.connected) {
      return null;
    }

    return clientRef.current.subscribe(destination, (message: IMessage) => {
      if (message.body) {
        try {
          const data: T = JSON.parse(message.body);
          callback(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      }
    });
  };

  // Send a message to a destination
  const send = (destination: string, body: any) => {
    if (!clientRef.current || !clientRef.current.connected) {
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    });
  };

  // Connect when user is authenticated and has a token
  useEffect(() => {
    if (userId && accessToken) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, accessToken, connect, disconnect]);

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Custom hook to use the WebSocket context
 * @throws Error if used outside of a WebSocketProvider
 */
export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
