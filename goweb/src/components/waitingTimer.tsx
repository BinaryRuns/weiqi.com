"use client";

import { RootState } from "@/store/store";
import { incrementTime, stopWaiting } from "@/store/waitingSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSupabaseAuth } from "@/auth/SupabaseAuthProvider";
import { fetchWithAuth } from "@/utils/api";
import { Button } from "@/components/ui/button";

/**
 * WaitingTimer component for matchmaking queue
 * This component should be across all pages when the user is in the matchmaking queue
 */
const WaitingTimer: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSupabaseAuth();
  const userId = user?.id;
  const waiting = useSelector((state: RootState) => state.waiting.waiting);
  const waitingTime = useSelector(
    (state: RootState) => state.waiting.waitingTime
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (waiting) {
      interval = setInterval(() => {
        dispatch(incrementTime());
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [waiting, dispatch]);

  const cancelMatchmaking = async () => {
    try {
      const response = await fetchWithAuth(`/api/matchmaking/cancel`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel matchmaking");
      }

      console.log("Successfully cancelled matchmaking");
      dispatch(stopWaiting()); // Stop waiting timer
    } catch (error) {
      console.error("Error cancelling matchmaking:", error);
    }
  };

  if (!waiting) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 sm:right-6 md:right-8 lg:right-10 bg-gray-50 p-3 rounded-lg shadow-md border border-gray-200 backdrop-blur-sm z-50 min-w-[200px] w-[400px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 animate-spin [animation-duration:3s]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium">
            Matching<span className="mx-1">·</span>
            <span className="font-semibold text-gray-900">{waitingTime}s</span>
          </span>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={cancelMatchmaking}
          className="ml-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default WaitingTimer;
