"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Choose Your Game Mode</h1>

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

      <div className="mt-6">
        {selectedMode && (
          <Button
            onClick={() => alert(`Starting ${selectedMode} mode`)}
            className="w-full"
          >
            Start {selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}{" "}
            Game
          </Button>
        )}
      </div>
    </div>
  );
}
