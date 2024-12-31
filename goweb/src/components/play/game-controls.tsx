import { Button } from "@/components/ui/button";
import { 
  RotateCcwIcon, 
  UndoIcon, 
  FlagIcon,
  HandIcon
} from "lucide-react";

interface GameControlsProps {
  onUndo: () => void;
  onPass: () => void;
  onResign: () => void;
  onReset: () => void;
}

export function GameControls({ onUndo, onPass, onResign, onReset }: GameControlsProps) {
  return (
    <div className="bg-card rounded-lg p-4 space-y-4">
      <h3 className="font-semibold mb-4">Game Controls</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" onClick={onUndo}>
          <UndoIcon className="w-4 h-4 mr-2" />
          Undo
        </Button>
        <Button variant="outline" className="w-full" onClick={onPass}>
          <HandIcon className="w-4 h-4 mr-2" />
          Pass
        </Button>
        <Button 
          variant="outline" 
          className="w-full text-destructive hover:text-destructive"
          onClick={onResign}
        >
          <FlagIcon className="w-4 h-4 mr-2" />
          Resign
        </Button>
        <Button variant="outline" className="w-full" onClick={onReset}>
          <RotateCcwIcon className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}