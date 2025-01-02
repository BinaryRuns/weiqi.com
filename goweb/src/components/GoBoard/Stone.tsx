import React from 'react';
import { StoneProps, BoardSize } from './types';

export const Stone: React.FC<StoneProps & { boardSize?: BoardSize }> = ({
  color,
  isLastMove = false,
  boardSize = 19
}) => {
  if (!color) return null;

  // Calculate stone size based on board size
  const getStoneStyles = () => {
    switch (boardSize) {
      case 9:
        return {
          width: '150%',
          height: '150%',
          top: '-25%',
          left: '-25%'
        };
      case 13:
        return {
          width: '125%',
          height: '125%',
          top: '-15%',
          left: '-15%'
        };
      default:
        return {
          width: '100%',
          height: '100%',
          top: '0',
          left: '0'
        };
    }
  };

  const styles = getStoneStyles();

  return (
    <div
      className={`absolute rounded-full
        ${color === 'black' ? 'bg-black' : 'bg-white border border-gray-200'}
        ${isLastMove ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        shadow-md transition-all duration-150 ease-in-out
        hover:scale-105`}
      style={styles}
    />
  );
};