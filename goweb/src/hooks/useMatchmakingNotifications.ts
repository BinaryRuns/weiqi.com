import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { stopWaiting } from "@/store/waitingSlice";

// Define the structure of the matchmaking event
interface MatchFoundEvent {
  roomId: string;
  boardSize: number;
  timeControl: string;
}

/**
 * Hook that subscribes to matchmaking notifications via WebSocket
 * and navigates to the game room when a match is found
 */
export const useMatchmakingNotifications = () => {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const dispatch = useDispatch();
  const { subscribe, isConnected } = useWebSocket();

  useEffect(() => {
    if (!userId || !isConnected) {
      return;
    }

    // Subscribe to match-found notifications
    const subscription = subscribe<MatchFoundEvent>(
      `/user/queue/match-found`,
      (data) => {
        // Stop the waiting spinner/indicator
        dispatch(stopWaiting());
        
        if (!data || !data.roomId) {
          console.error("Invalid match data received");
          return;
        }

        // Store the game room ID in session storage as a backup mechanism
        try {
          sessionStorage.setItem('lastMatchRoomId', data.roomId);
        } catch (err) {
          // Non-critical error, just log it
          console.warn("Could not save game room ID to session storage");
        }
        
        try {
          const gameUrl = `/game/${data.roomId}`;
          
          // Use setTimeout to ensure this happens after the current execution context
          setTimeout(() => {
            router.push(gameUrl);
          }, 100);
        } catch (error) {
          console.error("Navigation to game room failed", error);
          
          // Fallback navigation method
          try {
            window.location.href = `/game/${data.roomId}`;
          } catch (fallbackError) {
            console.error("All navigation methods failed");
          }
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [userId, isConnected, subscribe, dispatch, router]);
};
