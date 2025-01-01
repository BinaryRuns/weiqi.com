import React from 'react';
import { StoneProps } from './types';



// TODO: Implement larger stones for smaller board grid
export const Stone: React.FC<StoneProps> = ({ color, isLastMove = false }) => {
  if (!color) return null;

  return (
    <div
      className={`absolute inset-0 rounded-full
        ${color === 'black' ? 'bg-black' : 'bg-white border border-gray-200'}
        ${isLastMove ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        shadow-md transition-all duration-150 ease-in-out
        hover:scale-105`}
    />
  );
};