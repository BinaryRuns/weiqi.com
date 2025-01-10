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
    {
      label: "Play Bots",
      description: "Play against AI bots of various difficulties",
      action: "/play/bots",
    },
    {
      label: "Play Online",
      description: "Challenge players online",
      action: "/play/online",
    },
    {
      label: "Play with Friend",
      description: "Play with a friend by inviting them",
      action: "#",
    },
    {
      label: "Join Tournaments",
      description: "Feature coming soon",
      action: "#",
    },
  ];

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="hidden md:flex w-full md:w-3/6 h-full flex-col bg-background p-6 md:ml-6">
        <div>
          <PlayerCard position="top" />
          <div className="flex-1 flex">
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
          <h1 className="text-3xl font-bold text-center mb-10">Play Go</h1>

          <div className="grid gap-4">
            {modes.map(({ label, description, action }) => (
              <Card
                key={label}
                className={cn(
                  "p-6 cursor-pointer transition-colors border rounded-lg",
                  selectedMode === label && "border-primary bg-primary/10"
                )}
              >
                <Link href={action}>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center text-2xl font-bold">
                      {/* TODO: add Icons here later */}
                    </div>
                    <div>
                      <h3 className="font-semibold">{label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
