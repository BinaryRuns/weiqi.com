import { Button } from "@/components/ui/button";
import { 
  RotateCcwIcon, 
  FlagIcon,
  HandIcon,
  HandshakeIcon
} from "lucide-react";

interface GameControlsProps {
  handleResign: () => void;
  handleDraw: () => void;
  handlePass?: () => void;
  handleRematch?: () => void;
  gameOver: boolean;
  isSpectator: boolean;
}

export function GameControls({ 
  handleResign, 
  handleDraw, 
  handlePass, 
  handleRematch, 
  gameOver, 
  isSpectator 
}: GameControlsProps) {
  // Don't show controls for spectators
  if (isSpectator) {
    return <div className="text-center py-2">You are spectating this game</div>;
  }

  return (
    <div className="bg-card rounded-lg p-4 space-y-4">
      <h3 className="font-semibold mb-4">Game Controls</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {gameOver ? (
          // Show rematch button when game is over
          <Button 
            variant="outline" 
            className="w-full col-span-2" 
            onClick={handleRematch}
            disabled={!handleRematch}
          >
            <RotateCcwIcon className="w-4 h-4 mr-2" />
            Rematch
          </Button>
        ) : (
          // Show game controls when game is active
          <>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handlePass}
              disabled={!handlePass}
            >
              <HandIcon className="w-4 h-4 mr-2" />
              Pass
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleDraw}
            >
              <HandshakeIcon className="w-4 h-4 mr-2" />
              Offer Draw
            </Button>
            <Button 
              variant="outline" 
              className="w-full col-span-2 text-destructive hover:text-destructive"
              onClick={handleResign}
            >
              <FlagIcon className="w-4 h-4 mr-2" />
              Resign
            </Button>
          </>
        )}
      </div>
    </div>
  );
}