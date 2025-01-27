import { useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { GameState } from "@/types/game-types";
import { ChatMessage } from "@/types/ChatMessage";

type GameMessageHandler = {
  onGameStateUpdate?: (state: GameState) => void;
  onTimerUpdate?: (timerData: any) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onGameEnd?: (result: any) => void;
};

export const useGameWebSocket = (
  gameId: string,
  userId: string,
  handlers: GameMessageHandler
) => {
  const { client, isConnected, connect, disconnect } = useWebSocket();

  useEffect(() => {
    if (!gameId || !userId || isConnected) return;
    connect(`http://localhost:8081/ws/`);

    return () => {
      disconnect();
    };
  }, [gameId, userId, isConnected]);

  useEffect(() => {
    if (!client || !isConnected) return;

    // Subscribe to game state updates
    const gameSub = client.subscribe(`/topic/game/${gameId}`, (message) => {
      const data = JSON.parse(message.body);
      handlers.onGameStateUpdate?.(data.gameRoom);
    });

    // Subscribe to timer updates
    const timerSub = client.subscribe(
      `/topic/game/${gameId}/timer`,
      (message) => {
        handlers.onTimerUpdate?.(JSON.parse(message.body));
      }
    );

    // Subscribe to chat messages
    const chatSub = client.subscribe(
      `/topic/game/${gameId}/chat`,
      (message) => {
        handlers.onChatMessage?.(JSON.parse(message.body));
      }
    );

    // Subscribe to game end events
    const gameEndSub = client.subscribe(
      `/topic/game/${gameId}/end`,
      (message) => {
        handlers.onGameEnd?.(JSON.parse(message.body));
      }
    );

    return () => {
      gameSub.unsubscribe();
      timerSub.unsubscribe();
      chatSub.unsubscribe();
      gameEndSub.unsubscribe();
    };
  }, [client, isConnected, gameId, handlers]);

  const sendMessage = (destination: string, body: any) => {
    if (client && isConnected) {
      client.publish({
        destination: `/app/game/${destination}/${gameId}`,
        body: JSON.stringify({ ...body, userId }),
      });
    }
  };

  return {
    sendMessage,
    isConnected,
  };
};
