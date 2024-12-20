"use client"

import React, { useState, useCallback } from 'react';

const BOARD_SIZE = 19;
const EMPTY = null;
const BLACK = 'black';
const WHITE = 'white';

const WeigiGame = () => {
  const initializeBoard = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY));
  
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState(BLACK);
  const [lastMove, setLastMove] = useState(null);
  const [capturedStones, setCapturedStones] = useState({ black: 0, white: 0 });
  const cellSize = 32;
  const boardSize = cellSize * (BOARD_SIZE - 1);


  const getAdjacent = useCallback((x, y) => {
    return [
      [x-1, y], [x+1, y], [x, y-1], [x, y+1]
    ].filter(([x, y]) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE);
  }, []);


  const findGroup = useCallback((x, y, color, boardState) => {
    const group = new Set();
    const stack = [[x, y]];

    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop();
      const key = `${currentX},${currentY}`;

      if (group.has(key)) continue;
      group.add(key);

      getAdjacent(currentX, currentY).forEach(([adjX, adjY]) => {
        if (boardState[adjY][adjX] === color) {
          stack.push([adjX, adjY]);
        }
      });
    }

    return group;
  }, [getAdjacent]);

  const hasLiberties = useCallback((group, boardState) => {
    for (const pos of group) {
      const [x, y] = pos.split(',').map(Number);
      const adjacent = getAdjacent(x, y);
      
      for (const [adjX, adjY] of adjacent) {
        if (boardState[adjY][adjX] === EMPTY) {
          return true;
        }
      }
    }
    return false;
  }, [getAdjacent]);


  const removeCapturedStones = useCallback((x, y, boardState) => {
    const color = boardState[y][x];
    const oppositeColor = color === BLACK ? WHITE : BLACK;
    let capturedCount = 0;
    const newBoard = boardState.map(row => [...row]);

    getAdjacent(x, y).forEach(([adjX, adjY]) => {
      if (newBoard[adjY][adjX] === oppositeColor) {
        const group = findGroup(adjX, adjY, oppositeColor, newBoard);
        if (!hasLiberties(group, newBoard)) {
          for (const pos of group) {
            const [captX, captY] = pos.split(',').map(Number);
            newBoard[captY][captX] = EMPTY;
            capturedCount++;
          }
        }
      }
    });

    return { newBoard, capturedCount };
  }, [getAdjacent, findGroup, hasLiberties]);

  const isValidMove = useCallback((x, y, boardState) => {
    if (boardState[y][x] !== EMPTY) return false;

    const tempBoard = boardState.map(row => [...row]);
    tempBoard[y][x] = currentPlayer;

    const group = findGroup(x, y, currentPlayer, tempBoard);
    if (hasLiberties(group, tempBoard)) return true;

    const { newBoard, capturedCount } = removeCapturedStones(x, y, tempBoard);
    if (capturedCount > 0) return true;

    if (lastMove) {
      const [lastX, lastY] = lastMove;
      if (lastX === x && lastY === y) return false;
    }

    return false;
  }, [currentPlayer, lastMove, findGroup, hasLiberties, removeCapturedStones]);


  const placeStone = (x, y) => {
    if (!isValidMove(x, y, board)) {
      console.log('Invalid move');
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[y][x] = currentPlayer;
    const { newBoard: finalBoard, capturedCount } = removeCapturedStones(x, y, newBoard);
 
    const newCapturedStones = { ...capturedStones };
    newCapturedStones[currentPlayer] += capturedCount;

    setBoard(finalBoard);
    setCapturedStones(newCapturedStones);
    setLastMove([x, y]);
    setCurrentPlayer(currentPlayer === BLACK ? WHITE : BLACK);
  };




// Render stone
const renderStone = (x, y) => {
    const stone = board[y][x];
    if (!stone) return null;
  
    return (
      <div
        className={`absolute w-7 h-7 rounded-full shadow-md
          ${stone === BLACK ? 'bg-black' : 'bg-white border border-gray-300'}`}
        style={{
          left: `${x * cellSize}px`,  
          top: `${y * cellSize}px`,   
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
        }}
      />
    );
  };
  

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex justify-between w-full max-w-md">
        <div>Black Captures: {capturedStones.black}</div>
        <div>White Captures: {capturedStones.white}</div>
      </div>

      <div 
        className="relative bg-amber-200 p-4 rounded-sm"
        style={{
          width: `${boardSize + 32}px`,
          height: `${boardSize + 32}px`
        }}
      >
        <div 
          className="relative" 
          style={{
            width: `${boardSize}px`,
            height: `${boardSize}px`
          }}
        >
          {/* Grid lines */}
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <React.Fragment key={i}>
              <div 
                className="absolute border-t border-black" 
                style={{
                  top: `${i * cellSize}px`,
                  left: 0,
                  right: 0
                }}
              />
              <div 
                className="absolute border-l border-black" 
                style={{
                  left: `${i * cellSize}px`,
                  top: 0,
                  bottom: 0
                }}
              />
            </React.Fragment>
          ))}

          {Array.from({ length: BOARD_SIZE }).map((_, y) => 
            Array.from({ length: BOARD_SIZE }).map((_, x) => (
              <div
                key={`intersection-${x}-${y}`}
                className="absolute cursor-pointer hover:bg-gray-500/20"
                style={{
                  left: `${x * cellSize}px`,
                  top: `${y * cellSize}px`,
                  width: '20px',
                  height: '20px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 4
                }}
                onClick={() => placeStone(x, y)}
              />
            ))
          )}




          {/* Stones */}
          {board.map((row, y) => 
            row.map((cell, x) => renderStone(x, y))
          )}

          {/* Star points */}
          {[3, 9, 15].map(x => 
            [3, 9, 15].map(y => (
              <div
                key={`star-${x}-${y}`}
                className="absolute w-2 h-2 bg-black rounded-full"
                style={{
                  left: `${x * cellSize}px`,
                  top: `${y * cellSize}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1
                }}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        Current Player: {currentPlayer}
      </div>
    </div>
  );
};

export default WeigiGame;