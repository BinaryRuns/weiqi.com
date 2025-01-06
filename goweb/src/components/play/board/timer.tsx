"use client";

import React, { useState, useEffect } from "react";

interface TimerProps {
  initialTime: number; // Initial time in seconds
  onTimeUp?: () => void; // Optional callback when timer reaches zero
  isRunning?: boolean; // Optional prop to start/stop the timer
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp, isRunning }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (!isRunning || time <= 0) {
      if (time <= 0) onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time, onTimeUp, isRunning]);

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
