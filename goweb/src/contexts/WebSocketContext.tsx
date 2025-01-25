// contexts/WebSocketContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAppDispatch } from "@/store/hooks";
import { gameActions } from "@/store/gameSlice";

type WebSocketContextType = {
  connect: (gameId: string, userId: string) => void;
  subscribe: (
    destination: string,
    callback: (message: IMessage) => void
  ) => () => void;
  sendMessage: <T>(destination: string, body: T) => void;
  isConnected: boolean;
  error: string | null;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useAppDispatch();
  const client = useRef<Client | null>(null);
  const subscriptions = useRef<Map<string, StompSubscription>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const currentGameId = useRef<string | null>(null);

  const handleSystemMessage = (message: IMessage) => {
    try {
      const payload = JSON.parse(message.body);
      switch (payload.type) {
        case "ERROR":
          dispatch(gameActions.setGameError(payload.message));
          break;
        case "GAME_EVENT":
          dispatch(gameActions.setGameStatus("playing"));
          break;
      }
    } catch (err) {
      console.error("Error processing system message:", err);
    }
  };

  const connect = (gameId: string, userId: string) => {
    if (client.current?.active) return;

    console.log("Connecting to game", gameId);

    currentGameId.current = gameId;
    setError(null);

    client.current = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8081/ws/`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.debug("[WS]", str),
    });

    client.current.onConnect = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Restore previous subscriptions
      subscriptions.current.forEach((_, destination) => {
        const sub = client.current!.subscribe(destination, handleSystemMessage);
        subscriptions.current.set(destination, sub);
      });

      // Join game room
      sendMessage("/app/game.join", { gameId, userId });
    };

    client.current.onStompError = (frame) => {
      setError(frame.headers.message || "WebSocket connection error");
    };

    client.current.onWebSocketClose = () => {
      setIsConnected(false);
      if (reconnectAttempts.current < 5) {
        const delay = Math.min(
          30000,
          1000 * Math.pow(2, reconnectAttempts.current)
        );
        setTimeout(() => connect(gameId, userId), delay);
        reconnectAttempts.current++;
      }
    };

    client.current.activate();
  };

  const subscribe = (
    destination: string,
    callback: (message: IMessage) => void
  ) => {
    if (!client.current?.connected) {
      console.error("Cannot subscribe - not connected");
      return () => {};
    }

    const subscription = client.current.subscribe(destination, callback);
    subscriptions.current.set(destination, subscription);

    return () => {
      subscription.unsubscribe();
      subscriptions.current.delete(destination);
    };
  };

  const sendMessage = <T,>(destination: string, body: T) => {
    if (client.current?.connected) {
      client.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.error("Cannot send message - not connected");
    }
  };

  useEffect(() => {
    return () => {
      if (client.current?.connected) {
        client.current.deactivate();
      }
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      connect,
      subscribe,
      sendMessage,
      isConnected,
      error,
    }),
    [isConnected, error]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};
