"use client"

import React, { useState } from 'react';

const Stone = ({ color, x, y, cellSize }) => {
  return (
    <div
      className={`absolute w-7 h-7 rounded-full shadow-md
        ${color === 'black' ? 'bg-black' : 'bg-white border border-gray-300'}`}
      style={{
        left: `${x * cellSize }px`,
        top: `${y * cellSize }px`,
        zIndex: 1,
      }}
    />
  );
};

const Board = ({ onIntersectionClick }) => {
  const size = 19;
  const cellSize = 32;
  const boardSize = cellSize * (size - 1);
  
  const letters = Array.from({ length: size }, (_, i) => 
    String.fromCharCode(65 + (i >= 8 ? i + 1 : i)));
  

  const numbers = Array.from({ length: size }, (_, i) => size - i);

  const handleClick = (x, y) => {

    const letter = letters[x];
    const number = size - y;
    console.log(`Clicked: ${letter}${number}`); 
    console.log(`Clicked: ${x}${y}`); 
    onIntersectionClick(x, y);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex mb-2">
        <div className="w-8" />
        {letters.map((letter) => (
          <div key={letter} className="w-8 text-center text-sm">
            {letter}
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="flex flex-col mr-2">
          {numbers.map((num) => (
            <div key={num} className="h-8 flex items-center justify-end pr-2 text-sm">
              {num}
            </div>
          ))}
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
            {Array.from({ length: size }).map((_, i) => (
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

            {/* Intersection points */}
            {Array.from({ length: size }).map((_, y) => 
              Array.from({ length: size }).map((_, x) => (
                <div
                  key={`intersection-${x}-${y}`}
                  className="absolute cursor-pointer hover:bg-gray-500/20"
                  style={{
                    left: `${x * cellSize}px`,
                    top: `${y * cellSize}px`,
                    width: '20px',
                    height: '20px',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1
                  }}
                  onClick={() => handleClick(x, y)}
                />
              ))
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
      </div>
    </div>
  );
};

const WeigiGame = () => {
  const [stones, setStones] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('black');
  const [lastClick, setLastClick] = useState(null);
  const cellSize = 32;

  const handleIntersectionClick = (x, y) => {
    // Update last click for debugging
    setLastClick({ x, y });
      
    // Check if intersection is already occupied
    if (stones.some(stone => stone.x === x && stone.y === y)) {
      return;
    }
    console.log(`${x} ${y}`)
    const newStone = { x, y, color: currentPlayer };
    setStones([...stones, newStone]);
    setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
  };

  
  return (
    <div className="relative">
      <div className="relative">
        <Board onIntersectionClick={handleIntersectionClick} />
        {stones.map((stone, index) => (
          
          <Stone
            key={`stone-${index}`}
            color={stone.color}
            x={stone.x}
            y={stone.y}
            cellSize={cellSize}
          />
        ))}
      </div>
      <div className="mt-4 text-center space-y-2">
        <div>Current Player: {currentPlayer}</div>
        {lastClick && (
          <div className="text-sm text-gray-600">
            Last Click - x: {lastClick.x}, y: {lastClick.y}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeigiGame;