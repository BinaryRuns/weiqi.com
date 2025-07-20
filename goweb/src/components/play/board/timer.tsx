"use client";

import React, { useState, useEffect, useRef } from "react";
import { GameStatus } from "@/types/game-types";

interface TimerProps {
  currentTime: number; // Time in seconds from server
  isActive?: boolean; // Whether this timer is for the active player
  onTimeUp?: () => void; // Optional callback when timer reaches zero
  gameStatus?: GameStatus; // Current game status
  increment?: number; // Time increment in seconds
}

const Timer: React.FC<TimerProps> = ({
  currentTime,
  isActive = false,
  onTimeUp,
  gameStatus = "WAITING",
  increment = 0
}) => {
  const [displayTime, setDisplayTime] = useState(currentTime);
  const lastServerUpdateRef = useRef<number>(Date.now());
  const serverTimeRef = useRef<number>(currentTime);
  const previousActiveRef = useRef<boolean>(isActive);
  const timeoutWarningThreshold = 10; // Seconds
  const criticalTimeThreshold = 5; // Seconds
  
  // Update references when server time changes
  useEffect(() => {
    console.log(`Timer update - isActive: ${isActive}, time: ${currentTime}`);
    
    // If this player just became inactive (was active before), they just made a move
    // So we should show their time with the increment applied
    if (previousActiveRef.current && !isActive && increment > 0) {
      console.log(`Player just made a move, adding increment: ${increment}`);
      serverTimeRef.current = currentTime;
      setDisplayTime(currentTime);
    } else {
      serverTimeRef.current = currentTime;
      setDisplayTime(currentTime);
    }
    
    lastServerUpdateRef.current = Date.now();
    previousActiveRef.current = isActive;
  }, [currentTime, isActive, increment]);

  // Client-side timer for active player only
  useEffect(() => {
    // Don't run timer if game hasn't started or is over
    if (gameStatus === "WAITING" || gameStatus === "FINISHED") {
      return;
    }

    // For the active player, we want to show a countdown
    if (isActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsedSinceUpdate = (now - lastServerUpdateRef.current) / 1000;
        const estimatedCurrentTime = Math.max(0, serverTimeRef.current - elapsedSinceUpdate);
        
        setDisplayTime(Math.floor(estimatedCurrentTime));
        
        // More frequent updates when time is running low
        const updateFrequency = estimatedCurrentTime < criticalTimeThreshold ? 50 : 100;
        
        if (estimatedCurrentTime <= 0) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
        }
      }, 100); // Update 10 times per second for smooth countdown
      
      return () => clearInterval(interval);
    }
  }, [isActive, gameStatus, onTimeUp, criticalTimeThreshold]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Determine visual indicators based on time remaining
  const getTimerClasses = () => {
    const baseClasses = "flex items-center justify-center text-white font-mono text-xl px-6 py-2 rounded-lg shadow-md";
    
    if (gameStatus !== "IN_GAME") {
      return `${baseClasses} bg-gray-800`;
    }
    
    if (!isActive) {
      return `${baseClasses} bg-gray-800`;
    }
    
    // Active timer with different colors based on time remaining
    if (displayTime <= criticalTimeThreshold) {
      return `${baseClasses} bg-red-600 animate-pulse`;
    } else if (displayTime <= timeoutWarningThreshold) {
      return `${baseClasses} bg-orange-500`;
    } else {
      return `${baseClasses} bg-blue-600`;
    }
  };

  return (
    <div className={getTimerClasses()}>
      {gameStatus === "WAITING" ? (
        <span className="text-sm">Waiting to start</span>
      ) : (
        <span>{formatTime(displayTime)}</span>
      )}
    </div>
  );
};

export default Timer;
