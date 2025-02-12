"use client";

import React from "react";

interface PuzzleGameStatusProps {
  isSolved: boolean;
  progress: number;
}

export const PuzzleGameStatus: React.FC<PuzzleGameStatusProps> = ({ isSolved, progress }) => {
  const getProgressColor = () => {
    if (progress <= 33) {
      return `from-red-500 to-yellow-500`;
    } else if (progress <= 66) {
      return `from-yellow-500 to-blue-500`;
    }
    return `from-blue-500 to-green-500`;
  };

  return (
    <div className="space-y-2">
      <div className="text-center p-4">
        {isSolved ? (
          <p className="text-green-500 font-bold">Puzzle Solved! 🎉</p>
        ) : (
          <p className="text-white">Keep going, you&apos;re doing great!</p>
        )}
      </div>
      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-300 ease-out`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
