import { Button } from "@/components/ui/button";

const GameControls = ({
  gameOver,
  handleDraw,
  handleResign,
  handleRematch,
}: {
  gameOver: boolean;
  handleDraw: () => void;
  handleResign: () => void;
  handleRematch: () => void;
}) => {
  return (
    <div className="mt-4 flex flex-col items-center space-y-4">
      {gameOver ? (
        // Post-game options
        <>
          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
            onClick={handleRematch}
          >
            Rematch
          </button>
          <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg">
            Game Review
          </button>
          <button
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            New 10 min
          </button>
        </>
      ) : (
        // In-game options
        <>
          <Button
            className="w-full bg-transparent border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold py-2 rounded-lg transition-all duration-300"
            onClick={handleResign}
          >
            Resign
          </Button>
          <Button
            className="w-full bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-600 hover:text-white font-semibold py-2 rounded-lg transition-all duration-300"
            onClick={handleDraw}
          >
            Offer Draw
          </Button>
        </>
      )}
    </div>
  );
};

export default GameControls;
