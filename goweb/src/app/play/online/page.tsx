"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Board } from "@/components/GoBoard/Board";
import PlayerCard from "@/components/play/board/playercard"; 

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const modes = [
    
  ];

  return (
    <div className="flex h-screen flex-col md:flex-row">
    
      <div className="md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div>
          <PlayerCard position="top" /> 
          <div className="flex-1 flex ">
            <div className="w-full h-full max-w-[100%] max-h-[100%]">
              <Board size={19} stones={[]} />
            </div>
          </div>

          <div className="mt-2">
            <PlayerCard position="bottom" /> 
          </div>
        </div>
      </div>

      {/* Right side - Card */}
      <div className="w-full md:w-[500px] h-full p-6 overflow-y-auto"> 
        <div className="bg-bigcard p-6 rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center mb-10">New Game</h1>

       
        </div>
      </div>
    </div>
  );
}
