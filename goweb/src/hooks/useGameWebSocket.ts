// hooks/useGameWebSocket.ts
import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useAppDispatch } from "../store/hooks";
import { gameActions } from "../store/gameSlice";

export const useGameWebSocket = (gameId: string) => {
  const { subscribe, sendMessage } = useWebSocket();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribeGame = subscribe(`/topic/game/${gameId}`, (message) => {
      const data = JSON.parse(message.body);
      switch (data.action) {
        case "STATE_UPDATE":
          dispatch(gameActions.setGameState(data.state));
          break;
        case "MOVE_ACCEPTED":
          dispatch(gameActions.updateBoard(data.stones));
          break;
      }
    });

    const unsubscribeTimer = subscribe(
      `/topic/game/${gameId}/timer`,
      (message) => {
        dispatch(gameActions.updateTimer(JSON.parse(message.body)));
      }
    );

    const unsubscribeChat = subscribe(
      `/topic/game/${gameId}/chat`,
      (message) => {
        dispatch(gameActions.addChatMessage(JSON.parse(message.body)));
      }
    );

    return () => {
      unsubscribeGame();
      unsubscribeTimer();
      unsubscribeChat();
    };
  }, [gameId, subscribe, dispatch]);

  return {
    sendMove: (x: number, y: number) =>
      sendMessage(`/app/game/${gameId}/move`, { x, y }),
    sendChat: (message: string) =>
      sendMessage(`/app/game/${gameId}/chat`, { message }),
    sendResign: () => sendMessage(`/app/game/${gameId}/resign`, {}),
  };
};
