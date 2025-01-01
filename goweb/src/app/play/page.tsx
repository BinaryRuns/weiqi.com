"use client";

import React, { useState } from 'react';
import { Board } from '@/components/GoBoard/Board';
import { BoardSize, Position, StoneColor } from '@/components/GoBoard/types';

function App() {
  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [stones, setStones] = useState<StoneColor[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<StoneColor>('black');
  const [lastMove, setLastMove] = useState<Position | null>(null);

  const handleIntersectionClick = (position: Position) => {
    if (stones[position.y][position.x]) return;

    const newStones = stones.map(row => [...row]);
    newStones[position.y][position.x] = currentPlayer;
    setStones(newStones);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
    setLastMove(position);
  };

  const handleSizeChange = (newSize: BoardSize) => {
    setBoardSize(newSize);
    setStones(Array(newSize).fill(null).map(() => Array(newSize).fill(null)));
    setLastMove(null);
    setCurrentPlayer('black');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl mb-4">Go Board</h1>
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => handleSizeChange(19)}
              className={`px-4 py-2 rounded ${
                boardSize === 19 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              19x19
            </button>
            <button
              onClick={() => handleSizeChange(13)}
              className={`px-4 py-2 rounded ${
                boardSize === 13 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              13x13
            </button>
            <button
              onClick={() => handleSizeChange(9)}
              className={`px-4 py-2 rounded ${
                boardSize === 9 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              9x9
            </button>
          </div>
          <div className="mb-4">
            <p className="text-lg">
              Current Player:{' '}
              <span className="capitalize">{currentPlayer}</span>
            </p>
          </div>
          <div className="aspect-square max-w-2xl mx-auto">
            <Board
              size={boardSize}
              stones={stones}
              onIntersectionClick={handleIntersectionClick}
              lastMove={lastMove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;