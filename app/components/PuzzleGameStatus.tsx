"use client";

import React from "react";

interface PuzzleGameStatusProps {
  isSolved: boolean;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({ isSolved }) => {
  return (
    <div 
      className={`text-center p-4 rounded-lg ${
        isSolved ? 'bg-green-600' : 'bg-yellow-600'
      }`}
    >
      {isSolved ? (
        <p className="text-white font-bold">Puzzle Solved! 🎉</p>
      ) : (
        <p className="text-white">Keep going, you&apos;re doing great!</p>
      )}
    </div>
  );
};
