"use client";

import React, { useState, useEffect } from "react";

interface TimerProps {
  currentTime: number; // Initial time in seconds
  onTimeUp?: () => void; // Optional callback when timer reaches zero
}

const Timer: React.FC<TimerProps> = ({ currentTime, onTimeUp }) => {
  const [time, setTime] = useState(currentTime);

  // Update local state when currentTime prop changes
  useEffect(() => {
    setTime(currentTime);
    if (currentTime <= 0) {
      onTimeUp?.();
    }
  }, [currentTime, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center bg-gray-800 text-white font-mono text-xl px-6 py-2 rounded-lg shadow-md">
      <span>{formatTime(time)}</span>
    </div>
  );
};

export default Timer;
