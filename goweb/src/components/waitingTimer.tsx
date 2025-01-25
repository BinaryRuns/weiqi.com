"use client";

import { RootState } from "@/store/store";
import { incrementTime } from "@/store/waitingSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

/**
 * WaitingTimer component for matchmaking queue
 * This component should be across all pages when the user is in the matchmaking queue
 */
const WaitingTimer: React.FC = () => {
  const dispatch = useDispatch();
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

  if (!waiting) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card/50 p-4 rounded-lg">
      <p className="text-sm text-foreground">
        Waiting for a match for {waitingTime} seconds
      </p>
    </div>
  );
};

export default WaitingTimer;
