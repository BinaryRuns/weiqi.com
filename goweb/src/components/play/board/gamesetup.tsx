import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BoardSize = 9 | 13 | 19;

interface TimeControl {
  label: string;
  value: string;
  time: string;
  description: string;
}

interface BoardSizeOption {
  label: string;
  value: BoardSize;
  description: string;
}

interface GameSetupProps {
  onBoardSizeChange: (size: BoardSize) => void;
  onGameSetup: (config: { size: BoardSize; timeControl: string }) => void;
  initialBoardSize: BoardSize;
}

const GameSetup: React.FC<GameSetupProps> = ({
  onBoardSizeChange,
  onGameSetup,
  initialBoardSize,
}) => {
  const [selectedSize, setSelectedSize] = useState<BoardSize>(initialBoardSize);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const boardSizes: BoardSizeOption[] = [
    {
      label: "9×9",
      value: 9,
      description: "Quick games, perfect for beginners",
    },
    {
      label: "13×13",
      value: 13,
      description: "Medium size, balanced gameplay",
    },
    {
      label: "19×19",
      value: 19,
      description: "Traditional size, full strategy",
    },
  ];

  const timeControls: TimeControl[] = [
    {
      label: "Blitz",
      value: "blitz",
      time: "5 min + 10s byoyomi",
      description: "Fast-paced game",
    },
    {
      label: "Standard",
      value: "standard",
      time: "10 min + 30s byoyomi",
      description: "Balanced time control",
    },
    {
      label: "Classical",
      value: "classical",
      time: "30 min + 60s byoyomi",
      description: "Traditional timing",
    },
  ];

  const handleSizeSelect = (size: BoardSize) => {
    setSelectedSize(size);
    onBoardSizeChange(size);
  };

  const handleStartGame = () => {
    if (selectedSize && selectedTime) {
      onGameSetup({ size: selectedSize, timeControl: selectedTime });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Board Size</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {boardSizes.map((size) => (
            <Card
              key={size.value}
              className={`cursor-pointer transition-all ${
                selectedSize === size.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSizeSelect(size.value)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{size.label}</CardTitle>
                <CardDescription className="text-sm">
                  {size.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Select Time Control</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeControls.map((time) => (
            <Card
              key={time.value}
              className={`cursor-pointer transition-all ${
                selectedTime === time.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedTime(time.value)}
            >
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{time.label}</CardTitle>
                <CardDescription className="text-sm">
                  {time.time}
                  <br />
                  {time.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <Button
          size="lg"
          className="w-full md:w-auto"
          disabled={!selectedTime}
          onClick={handleStartGame}
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default GameSetup;
