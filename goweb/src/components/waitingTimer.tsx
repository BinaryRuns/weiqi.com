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
    <div className="fixed top-4 right-4 sm:right-6 md:right-8 lg:right-10 bg-gray-50 p-3 rounded-lg shadow-md border border-gray-200 backdrop-blur-sm z-50 min-w-[200px] w-[400px]">
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
    </div>
  );
};

export default WaitingTimer;
