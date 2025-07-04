"use client";

import React, { useState, useEffect, useRef } from "react";

interface TimerProps {
  currentTime: number; // Time in seconds
  isActive?: boolean; // Whether this timer is for the active player
  onTimeUp?: () => void; // Optional callback when timer reaches zero
}

const Timer: React.FC<TimerProps> = ({
  currentTime,
  isActive = false,
  onTimeUp,
}) => {
  const [displayTime, setDisplayTime] = useState(currentTime);
  const lastUpdateRef = useRef<number>(Date.now());
  const currentTimeRef = useRef<number>(currentTime);

  // Update reference when prop changes
  useEffect(() => {
    currentTimeRef.current = currentTime;
    lastUpdateRef.current = Date.now();
    setDisplayTime(currentTime);

    // We no longer need to call onTimeUp here as the server will send a timeout notification
    // through WebSocket which will be handled in the game page
  }, [currentTime]);

  // Client-side interpolation for smoother countdown
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastUpdateRef.current) / 1000);
      const interpolated = Math.max(0, currentTimeRef.current - elapsed);

      setDisplayTime(interpolated);

      // We no longer need to call onTimeUp here as the server will send a timeout notification
      if (interpolated <= 0) {
        clearInterval(interval);
      }
    }, 100); // Update display 10 times per second for smooth countdown

    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Add visual indicators for active timer and low time
  const timerClasses = `flex items-center justify-center 
    ${isActive ? "bg-blue-600" : "bg-gray-800"} 
    text-white font-mono text-xl px-6 py-2 rounded-lg shadow-md
    ${displayTime < 30 ? "animate-pulse text-red-300" : ""}`;

  return (
    <div className={timerClasses}>
      <span>{formatTime(displayTime)}</span>
    </div>
  );
};

export default Timer;
