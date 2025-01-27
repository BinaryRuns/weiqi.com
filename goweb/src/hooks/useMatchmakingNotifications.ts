import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { stopWaiting } from "@/store/waitingSlice";

// Define the structure of the matchmaking event
interface MatchFoundEvent {
  roomId: string;
  boardSize: number;
  timeControl: string;
}

export const useMatchmakingNotifications = () => {
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.auth.userId);
  const dispatch = useDispatch();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!userId || !isConnected) return;

    console.log("Subscribing to /user/queue/match-found");
    const subscription = subscribe<MatchFoundEvent>(
      `/user/queue/match-found`,
      (data) => {
        dispatch(stopWaiting());
        console.log("Match found:", data);
        router.push(`/game/${data.roomId}`);
      }
    );

    return () => {
      console.log("Unsubscribing from /user/queue/match-found");
      subscription?.unsubscribe();
    };
  }, [userId, isConnected]);
};
