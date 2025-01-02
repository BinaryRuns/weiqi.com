"use client";

import { useState } from 'react';
import { getInitialGameState } from '@/lib/game/board-utils';
import { Board } from '@/components/GoBoard/Board'; 
import { BoardSelector } from '@/components/play/mode-selector';
import { GameControls } from '@/components/play/game-controls';
import { GameInfo } from '@/components/play/game-info';
import { BoardSize, Position, StoneColor } from '@/components/GoBoard/types';

export default function PlayPage() {
  const [boardSize, setBoardSize] = useState<BoardSize>(19);
  const [gameStarted, setGameStarted] = useState(false);
  const [stones, setStones] = useState<StoneColor[][]>(
    Array(boardSize).fill(null).map(() => Array(boardSize).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<StoneColor>('black');
  const [moveCount, setMoveCount] = useState(0);
  const [gameMode, setGameMode] = useState<'online' | 'bot' | 'friend' | null>(null); // New state for game mode selection

  const handleMove = (position: Position) => {
    if (stones[position.y][position.x]) return; // Prevent placing a stone on an occupied position

    const newStones = stones.map(row => [...row]);
    newStones[position.y][position.x] = currentPlayer;
    setStones(newStones);
    setMoveCount(prev => prev + 1);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  };

  const handleStartGame = () => {
    setStones(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
    setMoveCount(0);
    setCurrentPlayer('black');
    setGameStarted(true);
  };

  // UI to choose game mode
  const renderGameModeSelection = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select Game Mode</h2>
      <button onClick={() => setGameMode('friend')} className="btn btn-primary w-full">Play with a Friend</button>
      <button onClick={() => setGameMode('bot')} className="btn btn-primary w-full">Play against Bot</button>
      <button onClick={() => setGameMode('online')} className="btn btn-primary w-full">Play Online</button>
    </div>
  );

  // Render board selection after game mode is selected
  const renderBoardSelection = () => (
    <BoardSelector 
      selectedSize={boardSize} 
      onSelectSize={setBoardSize}
      onStartGame={handleStartGame}
    />
  );

  if (!gameStarted) {
    if (gameMode === null) {
      return (
        <div className="container mx-auto px-4 py-8">
          {renderGameModeSelection()}
        </div>
      );
    } else {
      return (
        <div className="container mx-auto px-4 py-8">
          {renderBoardSelection()}
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8">
        <div className="aspect-square max-w-2xl mx-auto">
          <Board
            size={boardSize}
            stones={stones}
            onIntersectionClick={handleMove}
          />
        </div>
        <div className="space-y-6">
          <GameInfo 
            currentPlayer={currentPlayer}
            moveCount={moveCount} 
            captures={{
              black: 0,
              white: 0
            }}          
          />
          <GameControls 
            onUndo={() => {/* TODO: Implement Undo */}}
            onPass={() => {/* TODO: Implement Pass */}}
            onResign={() => {/* TODO: Implement Resign */}}
            onReset={() => {
              setStones(Array(boardSize).fill(null).map(() => Array(boardSize).fill(null)));
              setMoveCount(0);
              setCurrentPlayer('black');
            }}
          />
        </div>
      </div>
    </div>
  );
}
