import React from 'react';
import { BoardProps, Position } from './types';
import { Stone } from './Stone';

export const Board: React.FC<BoardProps> = ({
  size,
  stones,
  onIntersectionClick,
  lastMove,
}) => {
  const handleClick = (x: number, y: number) => {
    onIntersectionClick?.({ x, y });
  };

  const renderGrid = () => {
    const gridLines = [];
    for (let i = 0; i < size; i++) {
      // Horizontal lines
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
      // Vertical lines
      gridLines.push(
        <div
          key={`v${i}`}
          className="absolute bg-black/30"
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

    for (const [x, y] of starPointPositions) {
      starPoints.push(
        <div
          key={`star-${x}-${y}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5"
          style={{
            left: `${(x * 100) / (size - 1)}%`,
            top: `${(y * 100) / (size - 1)}%`,
          }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-full" />
        </div>
      );
    }
    return starPoints;
  };

  const renderStones = () => {
    const stoneElements = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const isLastMove = lastMove?.x === x && lastMove?.y === y;
        stoneElements.push(
          <div
            key={`intersection-${x}-${y}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{
              width: '5%',
              height: '5%',
              left: `${(x * 100) / (size - 1)}%`,
              top: `${(y * 100) / (size - 1)}%`,
            }}
            onClick={() => handleClick(x, y)}
          >
            <Stone color={stones[y][x]} isLastMove={isLastMove} />
          </div>
        );
      }
    }
    return stoneElements;
  };

  return (
    <div className="relative w-full aspect-square bg-[#E6BC6A] rounded-lg shadow-xl">
      <div className="absolute inset-[5%]">
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
    // 9x9
    return [
      [2, 2],
      [2, 6],
      [4, 4],
      [6, 2],
      [6, 6],
    ];
  }
}