import React from 'react';
import { BoardProps, Position } from './types';
import { Stone } from './Stone';

export const Board: React.FC<BoardProps> = ({
  size = 19,         
  stones = [],       
  onIntersectionClick = () => {},  
  lastMove = null,   
}) => {
  const handleClick = (x: number, y: number) => {
    onIntersectionClick?.({ x, y });
  };

  const getGridStyle = () => {
    switch (size) {
      case 9:
        return {
          width: '80%',
          height: '80%',
          top: '10%',
          left: '10%',
        };
      case 13:
        return {
          width: '85%',
          height: '85%',
          top: '7.5%',
          left: '7.5%',
        };
      default:
        return {
          width: '90%',
          height: '90%',
          top: '5%',
          left: '5%',
        };
    }
  };

  const getIntersectionSize = () => {
    switch (size) {
      case 9:
        return '7.5%';
      case 13:
        return '6%';
      default:
        return '5%';
    }
  };

  // Get star point size based on board size
  const getStarPointSize = () => {
    switch (size) {
      case 9:
        return '1%';
      case 13:
        return '1%';
      default:
        return '1%';
    }
  };

  const renderGrid = () => {
    const gridLines = [];
    for (let i = 0; i < size; i++) {
      gridLines.push(
        <div
          key={`h${i}`}
          className="absolute bg-black/30"
          style={{
            left: '0',
            right: '0',
            height: '0.5px',
            top: `${(i * 100) / (size - 1)}%`,
          }}
        />
      );
      gridLines.push(
        <div
          key={`v${i}`}
          className="absolute bg-black/35"
          style={{
            top: '0',
            bottom: '0',
            width: '0.5px',
            left: `${(i * 100) / (size - 1)}%`,
          }}
        />
      );
    }
    return gridLines;
  };

  const renderStarPoints = () => {
    const starPoints = [];
    const starPointPositions = getStarPointPositions(size);
    const starPointSize = getStarPointSize();

    for (const [x, y] of starPointPositions) {
      starPoints.push(
        <div
          key={`star-${x}-${y}`}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            width: starPointSize,
            height: starPointSize,
            left: `${(x * 100) / (size - 1)}%`,
            top: `${(y * 100) / (size - 1)}%`,
          }}
        >
          <div className="absolute inset-0 bg-black/80 rounded-full" />
        </div>
      );
    }
    return starPoints;
  };

  const renderStones = () => {
    if (!stones || stones.length === 0 || !onIntersectionClick) return null;

    const stoneElements = [];
    const intersectionSize = getIntersectionSize();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isLastMove = lastMove?.x === x && lastMove?.y === y;
        stoneElements.push(
          <div
            key={`intersection-${x}-${y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              width: intersectionSize,
              height: intersectionSize,
              left: `${(x * 100) / (size - 1)}%`,
              top: `${(y * 100) / (size - 1)}%`,
            }}
            onClick={() => handleClick(x, y)}
          >
            <Stone 
              color={stones[y]?.[x]}
              isLastMove={isLastMove} 
              boardSize={size}
            />
          </div>
        );
      }
    }
    return stoneElements;
  };

  const gridStyle = getGridStyle();

  return (
    <div className="relative w-full aspect-square bg-[#E6BC6A] rounded-lg shadow-xl">
      <div 
        className="absolute"
        style={{
          width: gridStyle.width,
          height: gridStyle.height,
          top: gridStyle.top,
          left: gridStyle.left,
        }}
      >
        {renderGrid()}
        {renderStarPoints()}
        {renderStones()}
      </div>
    </div>
  );
};

function getStarPointPositions(size: number): [number, number][] {
  if (size === 19) {
    return [
      [3, 3],
      [3, 9],
      [3, 15],
      [9, 3],
      [9, 9],
      [9, 15],
      [15, 3],
      [15, 9],
      [15, 15],
    ];
  } else if (size === 13) {
    return [
      [3, 3],
      [3, 9],
      [6, 6],
      [9, 3],
      [9, 9],
    ];
  } else {
    return [
      [2, 2],
      [2, 6],
      [4, 4],
      [6, 2],
      [6, 6],
    ];
  }
}