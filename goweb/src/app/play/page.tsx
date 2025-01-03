"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Board } from "@/components/GoBoard/Board";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const PlayerCard = ({ position = "top" }) => {
  return (
    <div className="w-full text-white mt-2 mb-2 flex items-start gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-zinc-700">
          {position === "top" ? "O" : "P"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="mb-3 text-sm">
          {position === "top" ? "Opponent" : "Player"}
        </div>
      </div>
    </div>
  );
};

export default function PlayPage() {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const modes = [
    {
      label: "Play Bots",
      description: "Play against AI bots of various difficulties",
      action: () => setSelectedMode("bots"),
    },
    {
      label: "Play Online",
      description: "Challenge players online",
      action: () => setSelectedMode("online"),
    },
    {
      label: "Play with Friend",
      description: "Play with a friend by inviting them",
      action: () => setSelectedMode("friend"),
    },
  ];

  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Left side - Board with player cards */}
      <div className="hidden md:flex w-full md:w-3/6 h-full flex-col bg-background p-6">
        <div>
          <PlayerCard position="top" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full max-w-[100%] max-h-[100%]">
            <Board size={19} stones={[]} />
          </div>
        </div>

        <div>
          <PlayerCard position="bottom" />
        </div>
      </div>

      {/* Right side - Card */}
      <div className="w-full md:w-2/6 h-full p-6 overflow-y-auto">
        <div className="bg-bigcard p-6 rounded-lg h-full">
          <h1 className="text-3xl font-bold text-center mb-10">Play Go</h1>

          <div className="grid gap-4">
            {modes.map(({ label, description, action }) => (
              <Card
                key={label}
                className={cn(
                  "p-6 cursor-pointer transition-colors border rounded-lg",
                  selectedMode === label && "border-primary bg-primary/10"
                )}
                onClick={action}
              >
                <div className="flex flex-col items-center">
                  <div className="text-xl font-semibold">{label}</div>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
